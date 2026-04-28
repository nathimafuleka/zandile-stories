import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const { userEmail } = await request.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: params.id }
    })

    if (!chapter) {
      return NextResponse.json(
        { message: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Create or update chapter unlock for this user
    const unlock = await prisma.chapterUnlock.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: params.id
        }
      },
      create: {
        userId: user.id,
        chapterId: params.id
      },
      update: {}
    })

    return NextResponse.json({ 
      message: 'Chapter unlocked for user successfully',
      unlock 
    })
  } catch (error: any) {
    console.error('Unlock chapter for user error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to unlock chapter for user' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
