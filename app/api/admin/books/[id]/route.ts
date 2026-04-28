import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })
  } catch (error: any) {
    console.error('Get book error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch book' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const { title, description, coverImage, pdfFile, year, genre, status, releaseDate } = await request.json()

    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        title,
        description,
        coverImage: coverImage || null,
        pdfFile: pdfFile || null,
        year: year || null,
        genre: genre || null,
        status,
        releaseDate: releaseDate ? new Date(releaseDate) : null
      }
    })

    return NextResponse.json({ book })
  } catch (error: any) {
    console.error('Update book error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update book' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    await prisma.book.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error: any) {
    console.error('Delete book error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to delete book' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
