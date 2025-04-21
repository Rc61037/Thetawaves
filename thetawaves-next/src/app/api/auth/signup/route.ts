import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { SignUpRequest, AuthResponse, ErrorResponse, IUser } from '@/types/auth';
import { Error as MongooseError } from 'mongoose';

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
    const user = await newUser.save() as IUser;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Return success response
    return NextResponse.json<AuthResponse>({
      message: 'User created successfully',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      }
    }, { status: 201 });

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