import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('API Signin request received with body:', JSON.stringify(body));
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json({ message: 'Missing username or password' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`Signin attempt failed: User not found for username '${username}'`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log(`Signin attempt failed: Invalid password for username '${username}'`);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    return NextResponse.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Signin API Error:', error);
    return NextResponse.json({ message: 'Error logging in', error: error.message }, { status: 500 });
  }
} 