import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ErrorResponse {
  message: string;
  error?: string;
} 