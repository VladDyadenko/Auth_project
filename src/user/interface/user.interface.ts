import { Document } from 'mongoose';
import { User } from '../user.models';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  token: string;
 
}
export interface IToken extends Document {
  token: string;
  exp: Date;
  user: User;
  userId: string;
  userAgent: string;
 
}
