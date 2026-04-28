import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin with this email already exists' },
        { status: 400 }
      )
    }

    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    })

    if (!adminRole) {
      return NextResponse.json(
        { message: 'Admin role not found. Please run database seeder first.' },
        { status: 500 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: adminRole.id,
      }
    })

    return NextResponse.json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    )
  }
}
