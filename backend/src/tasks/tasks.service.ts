import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { Project, ProjectDocument } from 'src/projects/project.schema';
import { User, UserDocument } from 'src/users/user.schema';
import * as mongoose from 'mongoose';
import { TaskDto } from './task.dto';
@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createTask(taskDto: TaskDto) {
    try {
      // Validate the project ID (if provided)
      if (taskDto.PROJECT) {
        const projectExists = await this.projectModel.exists({
          _id: taskDto.PROJECT,
        });
        if (!projectExists) {
          return {
            status: 'FAILURE',
            message: 'Invalid project ID',
            httpStatus: HttpStatus.BAD_REQUEST,
            data: [],
          };
        }
      }

      // Validate the user ID (if provided)
      if (taskDto.ASSIGNEDTO) {
        const userExists = await this.userModel.exists({
          _id: taskDto.ASSIGNEDTO,
        });
        if (!userExists) {
          return {
            status: 'FAILURE',
            message: 'Invalid user ID',
            httpStatus: HttpStatus.BAD_REQUEST,
            data: [],
          };
        }
      }

      const validStatus = ['To Do', 'In Progress', 'Completed'];
      if (!validStatus.includes(taskDto.STATUS)) {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: `Status Must Be One Of The Following: ${validStatus.join(', ')}`,
          data: [],
        };
      }

      const newTask = new this.taskModel({
        TITLE: taskDto.TITLE,
        STATUS: taskDto.STATUS,
        DUEDATE: new Date(),
        PROJECT: taskDto.PROJECT,
        ASSIGNEDTO: taskDto.ASSIGNEDTO,
      });

      const createNewTask = await newTask.save();
      if (createNewTask) {
        return {
          status: 'SUCCESS',
          statuscode: HttpStatus.OK,
          message: 'Task Created Successfully',
          data: [],
        };
      } else {
        return {
          status: 'FAILURE',
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'Task Not Created',
          data: [],
        };
      }
    } catch (error) {
      console.error(error);
      throw new BadRequestException('EXCEPTION OCCURRED');
    }
  }

  async getTaskCompletionSummary() {
    const getTaskCompletionSummary = await this.taskModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    if (getTaskCompletionSummary) {
      return {
        status: 'SUCCESS',
        httpStatus: HttpStatus.OK,
        message: 'Task Completion Summary Found',
        data: getTaskCompletionSummary,
      };
    } else {
      return {
        status: 'FAILURE',
        httpStatus: HttpStatus.NOT_FOUND,
        message: 'Task Completion Summary Not Found',
        data: [],
      };
    }
  }

  async getUserPerformanceReport(assignedTo: string) {
    const objectId = new mongoose.Types.ObjectId(assignedTo);
    const result = await this.taskModel.aggregate([
      { $match: { ASSIGNEDTO: objectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      return {
        status: 'SUCCESS',
        httpStatus: HttpStatus.OK,
        message: 'User Performa Report Found',
        data: result,
      };
    } else {
      return {
        status: 'FAILURE',
        httpStatus: HttpStatus.NOT_FOUND,
        message: 'User Performa Report Not Found',
        data: [],
      };
    }
  }

  async getOverdueTasksSummary() {
    const today = new Date();
    const getOverdueTask = await this.taskModel.aggregate([
      { $match: { DUEDATE: { $lt: today }, STATUS: { $ne: 'Completed' } } },
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 },
        },
      },
    ]);

    if (getOverdueTask.length > 0) {
      return {
        status: 'SUCCESS',
        httpStatus: HttpStatus.OK,
        message: 'Overdue Task Summary Found',
        data: getOverdueTask,
      };
    } else {
      return {
        status: 'FAILURE',
        httpStatus: HttpStatus.NOT_FOUND,
        message: 'Overdue Task Summary Not Found',
        data: [],
      };
    }
  }

  async getProjectTaskSummaryWithMembers(projectId: string) {
    try {
      // Step 1: Ensure the project exists
      const project = await this.projectModel
        .findById(projectId)
        .populate('MEMBERS') // Populate members in the project
        .exec();

      if (!project) {
        return {
          status: 'FAILURE',
          httpStatus: HttpStatus.NOT_FOUND,
          message: 'Project not found',
          data: null,
        };
      }

      // Step 2: Get Task Summary by Status for the Project
      const taskSummary = await this.taskModel.aggregate([
        {
          $match: {
            PROJECT: new mongoose.Types.ObjectId(projectId),
          },
        },
        {
          $group: {
            _id: '$STATUS',
            totalTasks: { $sum: 1 },
          },
        },
      ]);

      // Step 3: Get Member Contributions (Completed Tasks)
      const memberContributions = await this.taskModel.aggregate([
        {
          $match: {
            PROJECT: new mongoose.Types.ObjectId(projectId),
            STATUS: 'Completed',
          },
        },
        {
          $group: {
            _id: '$ASSIGNEDTO',
            completedTasks: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users', // Join with the users collection
            localField: '_id', // The field in the current collection (task's ASSIGNEDTO)
            foreignField: '_id', // The field in the users collection (_id)
            as: 'userInfo', // Output the matched user info
          },
        },
        {
          $unwind: '$userInfo', // Unwind to get user details
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            username: '$userInfo.USERNAME', // Include the username
            completedTasks: 1, // Include the completed task count
          },
        },
      ]);

      // Step 4: Return the aggregated task summary and member contributions
      return {
        status: 'SUCCESS',
        httpStatus: HttpStatus.OK,
        message: 'Project Task Summary Found',
        data: {
          taskSummary, // Total tasks grouped by status
          memberContributions, // Members and their completed task counts
        },
      };
    } catch (error) {
      // Handle any errors that occur during aggregation
      return {
        status: 'FAILURE',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving project task summary',
        data: null,
      };
    }
  }

  async getTasks(page: number = 1, limit: number = 10, filter?: string) {
    try {
      const skip = (page - 1) * limit;

      // Create filter query for task titles and statuses
      const filterQuery = filter
        ? { TITLE: { $regex: filter, $options: 'i' } }
        : {};

      // Count total documents matching the filter
      const totalTasks = await this.taskModel
        .countDocuments(filterQuery)
        .exec();

      // Fetch tasks with pagination
      const tasks = await this.taskModel
        .find(filterQuery)
        .populate('PROJECT') // Populate project details if necessary
        .populate('ASSIGNEDTO') // Populate assigned user details if necessary
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        status: 'SUCCESS',
        httpStatus: HttpStatus.OK,
        message: 'Tasks retrieved successfully',
        data: tasks,
        meta: {
          totalTasks,
          currentPage: page,
          totalPages: Math.ceil(totalTasks / limit),
        },
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('EXCEPTION OCCURRED');
    }
  }
}
