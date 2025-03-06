import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString } from 'class-validator';
import { Document } from 'mongoose';
import { Tokens } from '../auth/intarfaces';
import mongoose from 'mongoose';

export type UserDocument = User & Document;

// user.schema.ts
@Schema({ versionKey: false })
export class User {
  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;
    
  @Prop({ required: true })
  password: string;

  @Prop({ default: ['user'] })
  roles: string[];

  @Prop()
  token: string;
}

@Schema({ versionKey: false })
export class Token {
  @Prop()
  token: string;

  @Prop()
  exp: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  user: User;

  @Prop()
  userId: string

  @Prop()
  userAgent: string;
} 
export const UserSchema = SchemaFactory.createForClass(User);
export const TokenSchema = SchemaFactory.createForClass(Token);
