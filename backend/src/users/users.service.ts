// src/users/users.service.ts
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UsersDto } from './users.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createUser(usersDto: UsersDto) {
    try {
      const emailAlreadyExists = await this.userModel.find({
        EMAIL: usersDto.EMAIL,
      });
      if (emailAlreadyExists.length > 0) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'User Email Already Exists',
          data: [],
        };
      }

      const validRoles = ['Admin', 'Manager', 'Member'];
      if (!validRoles.includes(usersDto.ROLE)) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: `Role Must Be One Of The Following: ${validRoles.join(', ')}`,
          data: [],
        };
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(usersDto.PASSWORD, saltRounds);

      // Create the new user
      const newUser = new this.userModel({
        USERNAME: usersDto.USERNAME,
        PASSWORD: hashedPassword,
        ROLE: usersDto.ROLE,
        EMAIL: usersDto.EMAIL,
      });

      const createNewUser = await newUser.save();
      if (createNewUser) {
        return {
          status: 'SUCCESS',
          statuscode: HttpStatus.OK,
          message: 'User Created Successfully',
          data: [],
        };
      } else {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'User Not Created',
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: 'FAILURE',
        message: 'EXCEPTION OCCURRED',
        statuscode: HttpStatus.BAD_REQUEST,
        data: [],
      };
    }
  }

  async getAllUsers(page: number, limit: number, filter: any) {
    try {
      const skip = (page - 1) * limit;

      const query = filter ? { ...filter } : {};

      const [users, total] = await Promise.all([
        this.userModel.find(query).select('-PASSWORD').skip(skip).limit(limit),
        this.userModel.countDocuments(query),
      ]);

      if (users.length > 0) {
        return {
          status: 'SUCCESS',
          message: 'Users Found',
          httpStatus: HttpStatus.OK,
          data: users,
          meta: {
            totalUsers: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          },
        };
      } else {
        return {
          status: 'FAILURE',
          message: 'No Users Found',
          httpStatus: HttpStatus.NOT_FOUND,
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: 'FAILURE',
        message: 'Exception Occurred',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        data: [],
      };
    }
  }

  async findOneUser(id: string) {
    try {
      const findOneUser = await this.userModel
        .findOne({ _id: id })
        .select('-PASSWORD');

      if (findOneUser) {
        return {
          status: 'SUCCESS',
          httpStatus: HttpStatus.OK,
          message: 'User Found Successfully',
          data: findOneUser,
        };
      } else {
        return {
          status: 'FAILURE',
          httpStatus: HttpStatus.NOT_FOUND,
          message: 'User Not Found',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: 'FAILURE',
        message: 'Exception Occured',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        data: [],
      };
    }
  }

  async updateUser(id: string, usersDto: UsersDto) {
    try {
      const userExists = await this.userModel.findById(id);

      if (!userExists) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.NOT_FOUND,
          message: 'User ID does not exist',
          data: [],
        };
      }

      const usernameExists = await this.userModel.findOne({
        _id: { $ne: id },
        USERNAME: usersDto.USERNAME,
      });

      if (usernameExists) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.CONFLICT,
          message: 'Username already exists',
          data: [],
        };
      }

      const emailAlreadyExists = await this.userModel.findOne({
        _id: { $ne: id },
        EMAIL: usersDto.EMAIL,
      });
      if (emailAlreadyExists) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'Email already exists',
          data: [],
        };
      }
      const validRoles = ['Admin', 'Manager', 'Member'];
      if (!validRoles.includes(usersDto.ROLE)) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: `Role Must Be One Of The Following: ${validRoles.join(', ')}`,
          data: [],
        };
      }

      const updatedData = {
        USERNAME: usersDto.USERNAME,
        PASSWORD: usersDto.PASSWORD,
        ROLE: usersDto.ROLE,
        EMAIL: usersDto.EMAIL,
      };

      const updateUser = await this.userModel.findByIdAndUpdate(
        id,
        updatedData,
        { new: true },
      );
      if (updateUser) {
        return {
          status: 'SUCCESS',
          statuscode: HttpStatus.OK,
          message: 'User updated successfully',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: 'FAILURE',
        message: 'Exception occurred',
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: [],
      };
    }
  }

  async getUsersWithTaskCounts() {
    // Check if the cached result exists
    const cachedResults = await this.cacheManager.get('taskCounts');
    if (cachedResults) {
      return {
        status: 'SUCCESS',
        data: cachedResults,
      };
    }

    // If not cached, run the aggregation query
    const results = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'ASSIGNEDTO',
          as: 'tasks',
        },
      },
      {
        $project: {
          USERNAME: 1,
          EMAIL: 1,
          ROLE: 1,
          taskCount: { $size: '$tasks' },
        },
      },
    ]);

    // Store the result in Redis with a TTL (time-to-live)
    await this.cacheManager.set('taskCounts', results, { ttl: 600 } as any); // Cache for 10 minutes

    return {
      status: 'SUCCESS',
      data: results,
    };
  }

  async findOneUserByEmail(email: string) {
    return this.userModel.findOne({ EMAIL: email });
  }
}
