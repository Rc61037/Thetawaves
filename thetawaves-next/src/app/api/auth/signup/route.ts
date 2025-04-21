import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignUpRequest, AuthResponse, ErrorResponse } from '@/types/auth';
import { Error as MongooseError, Types } from 'mongoose';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse | ErrorResponse>> {
  try {
    await dbConnect();
    const body = await request.json() as SignUpRequest;
    console.log('API Signup request received with body:', JSON.stringify(body));
    const { email, username, password } = body;

    // Basic validation
    if (!email || !username || !password) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json<ErrorResponse>(
        { message: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Create new user (password hashing handled by Mongoose pre-save hook)
    const newUser = new User({ email, username, password });
    const user = await newUser.save() as IUser & { _id: Types.ObjectId };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Create response with user data (excluding password)
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    // Set cookie with token
    const response = NextResponse.json<AuthResponse>(
      { 
        message: 'User created successfully',
        user: userResponse, 
        token 
      },
      { status: 201 }
    );
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup API Error:', error);
    // Distinguish between validation errors and others
    if (error instanceof MongooseError.ValidationError) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Validation Error', error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json<ErrorResponse>(
      { message: 'Error creating user', error: (error as Error).message },
      { status: 500 }
    );
  }
} 