import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const { title, content, order } = await request.json()

    const chapter = await prisma.chapter.update({
      where: { id: params.id },
      data: {
        title,
        content,
        order
      }
    })

    return NextResponse.json({ chapter })
  } catch (error: any) {
    console.error('Update chapter error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update chapter' },
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

    await prisma.chapter.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Chapter deleted successfully' })
  } catch (error: any) {
    console.error('Delete chapter error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to delete chapter' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
