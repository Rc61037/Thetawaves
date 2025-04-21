import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import jwt from 'jsonwebtoken';
import { SignInRequest, AuthResponse, ErrorResponse } from '@/types/auth';
import { Types } from 'mongoose';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse | ErrorResponse>> {
  try {
    await dbConnect();
    const body = await request.json() as SignInRequest;
    console.log('API Signin request received with body:', JSON.stringify(body));
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Missing username or password' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ username }) as (IUser & { _id: Types.ObjectId }) | null;
    if (!user) {
      console.log(`Signin attempt failed: User not found for username '${username}'`);
      return NextResponse.json<ErrorResponse>(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log(`Signin attempt failed: Invalid password for username '${username}'`);
      return NextResponse.json<ErrorResponse>(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

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
        message: 'Login successful',
        user: userResponse, 
        token 
      },
      { status: 200 }
    );
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signin API Error:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Error during signin', error: (error as Error).message },
      { status: 500 }
    );
  }
} 