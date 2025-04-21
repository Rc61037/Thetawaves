import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { SignInRequest, AuthResponse, ErrorResponse, IUser } from '@/types/auth';

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
    const user = await User.findOne({ username }) as IUser | null;
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
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Return success response
    return NextResponse.json<AuthResponse>({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Signin API Error:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Error logging in', error: (error as Error).message },
      { status: 500 }
    );
  }
} 