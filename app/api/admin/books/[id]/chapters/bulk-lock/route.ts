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

    const { lock } = await request.json()
    const bookId = params.id

    if (lock) {
      // When locking, skip prologue chapters
      // First, get all chapters for this book
      const allChapters = await (prisma as any).chapter.findMany({
        where: { bookId: bookId },
        select: { id: true, title: true }
      })
      
      // Filter out prologue chapters (case-insensitive)
      const nonPrologueChapters = allChapters.filter(
        (ch: any) => !ch.title.toLowerCase().includes('prologue')
      )
      
      // Update only non-prologue chapters
      let updatedCount = 0
      if (nonPrologueChapters.length > 0) {
        const result = await (prisma as any).chapter.updateMany({
          where: {
            id: {
              in: nonPrologueChapters.map((ch: any) => ch.id)
            }
          },
          data: {
            isLocked: true
          }
        })
        updatedCount = result.count
      }

      return NextResponse.json({ 
        message: 'Successfully locked all chapters (prologue remains unlocked)',
        updatedCount: updatedCount 
      })
    } else {
      // When unlocking, unlock all chapters
      const result = await (prisma as any).chapter.updateMany({
        where: {
          bookId: bookId
        },
        data: {
          isLocked: false
        }
      })

      return NextResponse.json({ 
        message: 'Successfully unlocked all chapters',
        updatedCount: result.count 
      })
    }
  } catch (error: any) {
    console.error('Bulk chapter lock error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update chapters' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
