import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Project, ProjectSchema } from './project.schema';
import { Task, TaskSchema } from 'src/tasks/task.schema'; // Import Task schema
import { User, UserSchema } from 'src/users/user.schema'; // Import User schema
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    // Import Project, Task, and User schemas
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema }, // Add Task schema here
      { name: User.name, schema: UserSchema }, // Add User schema here
    ]),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
