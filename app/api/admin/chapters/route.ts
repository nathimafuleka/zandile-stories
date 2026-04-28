import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const { bookId, title, content, order, isLocked } = await request.json()

    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        title,
        content,
        order,
        isLocked: isLocked !== undefined ? isLocked : true
      }
    })

    return NextResponse.json({ chapter }, { status: 201 })
  } catch (error: any) {
    console.error('Create chapter error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create chapter' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
