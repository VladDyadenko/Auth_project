import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString } from 'class-validator';
import { Document } from 'mongoose';

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

  @Prop({ default: null })
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
