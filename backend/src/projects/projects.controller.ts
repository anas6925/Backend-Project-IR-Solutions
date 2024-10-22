import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectDto } from './project.dto'; // Import your DTO
import { JwtAuthGuard } from '../auth/auth.guard';
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('createProject')
  @UseGuards(JwtAuthGuard)
  async createProject(@Body() projectDto: ProjectDto) {
    return this.projectsService.createProject(projectDto);
  }

  @Get('findAllProjects')
  @UseGuards(JwtAuthGuard)
  async findAllProjects(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string,
  ) {
    return this.projectsService.findAllProjects(page, limit, filter);
  }

  @Get('findOneProject/:id')
  @UseGuards(JwtAuthGuard)
  findOneProject(@Param('id') id: string) {
    return this.projectsService.findOneProject(id);
  }

  @Get('getProjectsWithUserTaskCounts')
  @UseGuards(JwtAuthGuard)
  async getProjectsWithUserTaskCounts() {
    return this.projectsService.getProjectsWithUserTaskCounts();
  }
}
