import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
        status: 'in_progress'
      }
    })

    // Fetch only coming soon books with future release dates
    const books = await prisma.book.findMany({
      where: {
        status: 'coming_soon',
        releaseDate: {
          gt: now
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
        releaseDate: true
      } as any
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Fetch coming soon books error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}
