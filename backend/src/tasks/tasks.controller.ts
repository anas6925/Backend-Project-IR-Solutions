import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskDto } from './task.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('createTask')
  @UseGuards(JwtAuthGuard)
  async createTask(@Body() taskDto: TaskDto) {
    return this.tasksService.createTask(taskDto);
  }

  @Get('completion-summary')
  @UseGuards(JwtAuthGuard)
  async getTaskCompletionSummary() {
    return this.tasksService.getTaskCompletionSummary();
  }

  @Get('user-performance/:assignedTo')
  @UseGuards(JwtAuthGuard)
  async getUserPerformanceReport(@Param('assignedTo') assignedTo: string) {
    return this.tasksService.getUserPerformanceReport(assignedTo);
  }

  @Get('overdue-summary')
  @UseGuards(JwtAuthGuard)
  async getOverdueTasksSummary() {
    return this.tasksService.getOverdueTasksSummary();
  }

  @Get('project-summary/:projectId')
  @UseGuards(JwtAuthGuard)
  async getProjectTaskSummaryWithMembers(
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.getProjectTaskSummaryWithMembers(projectId);
  }

  @Get('getTasks')
  @UseGuards(JwtAuthGuard)
  async getTasks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string,
  ) {
    return this.tasksService.getTasks(page, limit, filter);
  }
}
