import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Task, TaskSchema } from './task.schema';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Project, ProjectSchema } from 'src/projects/project.schema'; // Import the Project schema
import { User, UserSchema } from 'src/users/user.schema'; // Import the User schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema }, // Add Project schema here
      { name: User.name, schema: UserSchema }, // Add User schema here
    ]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
