import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('API Signup request received with body:', JSON.stringify(body));
    const { email, username, password } = body;

    // Basic validation
    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Create new user (password hashing handled by Mongoose pre-save hook)
    const user = new User({ email, username, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup API Error:', error);
    // Distinguish between validation errors and others
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', error: error.message }, { status: 400 });
    } 
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
} 