import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const { isLocked } = await request.json()

    const chapter = await prisma.chapter.update({
      where: { id: params.id },
      data: { isLocked }
    })

    return NextResponse.json({ chapter })
  } catch (error: any) {
    console.error('Toggle chapter lock error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to toggle chapter lock' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
