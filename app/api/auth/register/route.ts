import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate input - require either email or phone
    if (!name || (!email && !phone) || !password) {
      return NextResponse.json(
        { message: 'Name, password, and either email or phone number are required' },
        { status: 400 }
      )
    }

    // Check if user already exists with email
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists with phone
    if (phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: 'Phone number already registered' },
          { status: 400 }
        )
      }
    }

    // Get user role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' }
    })

    if (!userRole) {
      return NextResponse.json(
        { message: 'User role not found. Please run database seeder first.' },
        { status: 500 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        roleId: userRole.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    })

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    )

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    )
  }
}
