import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const { password } = await request.json()
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract user ID from token
    const token = authHeader.replace('Bearer ', '')
    const [userId] = Buffer.from(token, 'base64').toString().split(':')

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Password is incorrect' },
        { status: 401 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { message: 'Account deletion failed' },
      { status: 500 }
    )
  }
}
