import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    const { email, phone, password } = await request.json()

    // Validate input - require either email or phone
    if ((!email && !phone) || !password) {
      return NextResponse.json(
        { message: 'Email or phone number and password are required' },
        { status: 400 }
      )
    }

    // Find user by email or phone
    let user = null
    if (email) {
      user = await prisma.user.findUnique({
        where: { email }
      })
    } else if (phone) {
      user = await prisma.user.findUnique({
        where: { phone }
      })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}
