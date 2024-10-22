import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  USERNAME: string;

  @Prop({ required: true })
  PASSWORD: string;

  @Prop({ required: true })
  EMAIL: string;

  @Prop({ required: true, enum: ['Admin', 'Manager', 'Member'] })
  ROLE: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
