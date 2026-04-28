import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const chapters = await prisma.chapter.findMany({
      orderBy: [
        { book: { title: 'asc' } },
        { order: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        order: true,
        isLocked: true,
        book: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    const formattedChapters = chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      isLocked: chapter.isLocked,
      bookId: chapter.book.id,
      bookTitle: chapter.book.title
    }))

    return NextResponse.json({ chapters: formattedChapters })
  } catch (error: any) {
    console.error('Fetch all chapters error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch chapters' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
