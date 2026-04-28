import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()

    // Auto-update books that have passed their release date to completed status
    await (prisma as any).book.updateMany({
      where: {
        status: 'coming_soon',
        releaseDate: {
          lte: now
        }
      },
      data: {
        status: 'completed'
      }
    })

    // Fetch all completed and in-progress books (including those just updated)
    const books = await prisma.book.findMany({
      where: {
        status: {
          in: ['completed', 'in_progress']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        year: true,
        genre: true,
        status: true,
        _count: {
          select: { chapters: true }
        }
      }
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Fetch books error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}
