import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const books = await prisma.book.findMany({
      include: {
        _count: {
          select: { chapters: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ books })
  } catch (error: any) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch books' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const { title, description, coverImage, pdfFile, year, genre, status, releaseDate } = await request.json()

    const book = await prisma.book.create({
      data: {
        title,
        description,
        coverImage: coverImage || null,
        pdfFile: pdfFile || null,
        year: year || null,
        genre: genre || null,
        status: status || 'completed',
        releaseDate: releaseDate ? new Date(releaseDate) : null
      }
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error: any) {
    console.error('Create book error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create book' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
