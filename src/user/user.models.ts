import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserDocument = User & Document;
export type TokenDocument = Token & Document;

// user.schema.ts
@Schema({ versionKey: false })
export class User {
  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;
    
  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  token: string;
  
}

@Schema({ versionKey: false })
export class Token {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  exp: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userAgent: string;
} 
export const TokenSchema = SchemaFactory.createForClass(Token);
export const UserSchema = SchemaFactory.createForClass(User);
