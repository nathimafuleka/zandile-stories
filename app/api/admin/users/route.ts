import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const admin = verifyAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })

    const userCount = await prisma.user.count()

    return NextResponse.json({
      users,
      count: userCount
    })
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
