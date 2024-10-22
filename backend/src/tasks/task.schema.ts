import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  TITLE: string;

  @Prop({ required: true, enum: ['To Do', 'In Progress', 'Completed'] })
  STATUS: string;

  @Prop({ required: true })
  DUEDATE: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  PROJECT: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ASSIGNEDTO: mongoose.Schema.Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
