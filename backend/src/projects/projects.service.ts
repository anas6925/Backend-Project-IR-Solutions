import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import { User, UserDocument } from 'src/users/user.schema'; // Import the User schema
import { ProjectDto } from './project.dto'; // Import the DTO
import { Task, TaskDocument } from 'src/tasks/task.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async createProject(projectDto: ProjectDto) {
    try {
      // Fetch users based on provided usernames
      const users = await this.userModel.find({
        USERNAME: { $in: projectDto.MEMBERS },
      });

      if (users.length === 0) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'No Member Found With The Specified Usernames.',
          data: [],
        };
      }

      const memberIds = users.map((user) => user._id);

      // Fetch tasks based on provided task IDs
      const tasks = await this.taskModel.find({
        TITLE: { $in: projectDto.TASKS },
      });

      if (tasks.length === 0) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'No Tasks Found With The Specified Task IDs.',
          data: [],
        };
      }

      const taskIds = tasks.map((task) => task._id);

      const newProject = new this.projectModel({
        NAME: projectDto.NAME,
        TASKS: taskIds, // Use task IDs instead of the original projectDto.TASKS
        MEMBERS: memberIds,
      });

      const createNewProject = await newProject.save();

      if (createNewProject) {
        return {
          status: 'SUCCESS',
          statuscode: HttpStatus.OK,
          message: 'Project Created Successfully',
          data: createNewProject, // Include created project data if needed
        };
      } else {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'Project Not Created',
          data: [],
        };
      }
    } catch (error) {
      console.log('error', error);
      return {
        status: 'FAILURE',
        message: 'EXCEPTION OCCURRED',
        statuscode: HttpStatus.BAD_REQUEST,
        data: [],
      };
    }
  }

  async findAllProjects(page: number = 1, limit: number = 10, filter?: string) {
    try {
      const skip = (page - 1) * limit;

      const filterQuery = filter
        ? { NAME: { $regex: filter, $options: 'i' } }
        : {};

      const totalProjects = await this.projectModel
        .countDocuments(filterQuery)
        .exec();

      const findAllProjects = await this.projectModel
        .find(filterQuery)
        .populate({
          path: 'TASKS',

          select: '-PASSWORD',
        })
        .populate({
          path: 'MEMBERS',
          select: '-PASSWORD',
        })
        .skip(skip)
        .limit(limit)
        .exec();

      if (findAllProjects.length > 0 || totalProjects) {
        return {
          status: 'SUCCESS',
          statuscode: HttpStatus.OK,
          message: 'Projects Found Successfully',
          data: findAllProjects,
          meta: {
            totalProjects,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / limit),
          },
        };
      } else {
        return {
          status: 'FAILURE',
          httpStatus: HttpStatus.NOT_FOUND,
          message: 'Projects not found',
          data: null,
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

  async findOneProject(id: string) {
    try {
      const findOneProject = await this.projectModel.findOne({
        _id: id,
      });

      if (findOneProject) {
        return {
          status: 'SUCCESS',
          httpStatus: HttpStatus.OK,
          message: 'Project Found Successfully',
          data: findOneProject,
        };
      } else {
        return {
          status: 'FAILURE',
          httpStatus: HttpStatus.NOT_FOUND,
          message: 'Project Not Found',
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

  async getProjectsWithUserTaskCounts() {
    return await this.projectModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'MEMBERS',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'TASKS',
          foreignField: '_id',
          as: 'taskDetails',
        },
      },
      {
        $group: {
          _id: '$_id',
          NAME: { $first: '$NAME' },
          TASKS: { $first: '$taskDetails' },
          MEMBERS: { $first: '$userDetails' },
          taskCount: { $sum: { $size: '$taskDetails' } },
        },
      },
      {
        $project: {
          NAME: 1,
          MEMBERS: 1,
          taskCount: 1,
        },
      },
    ]);
  }
}
