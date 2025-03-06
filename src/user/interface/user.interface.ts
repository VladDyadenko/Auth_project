import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  token: string;
}
export interface IToken extends Document {
  token: string;
  exp: Date;
  userId: Types.ObjectId; 
  userAgent: string;
}
