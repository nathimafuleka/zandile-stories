import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'
import { validatePdfFile } from '@/lib/fileUtils'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from token if available
    let userId: string | null = null
    try {
      const token = getTokenFromRequest(request)
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        // Handle both 'id' and 'userId' field names
        userId = decoded.userId || decoded.id
        console.log('Book API - Decoded token:', decoded)
        console.log('Book API - Extracted userId:', userId)
      }
    } catch (err) {
      console.log('Book API - Token error:', err)
      // No valid token, continue as guest
    }

    const book = await (prisma as any).book.findFirst({
      where: { 
        id: params.id,
        status: {
          in: ['completed', 'in_progress']
        }
      },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            content: true,
            order: true,
            isLocked: true,
            userUnlocks: userId ? {
              where: { userId }
            } : false
          }
        },
        pdfPurchases: userId ? {
          where: { userId }
        } : false
      }
    } as any)

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      )
    }

    // Map chapters to include effective lock status
    const chaptersWithLockStatus = book.chapters.map((chapter: any) => {
      // userUnlocks is either an array (when userId exists) or false (when no userId)
      const unlocks = Array.isArray(chapter.userUnlocks) ? chapter.userUnlocks : []
      const hasUnlock = userId && unlocks.length > 0
      const finalLocked = chapter.isLocked && !hasUnlock
      console.log(`Chapter ${chapter.order} (${chapter.title}):`, {
        userId,
        globallyLocked: chapter.isLocked,
        userUnlocks: unlocks.length,
        hasUnlock,
        finalLocked
      })
      return {
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        order: chapter.order,
        // Chapter is unlocked if: globally unlocked OR user has specific unlock
        isLocked: finalLocked
      }
    })

    // Check if user has purchased PDF
    const pdfPurchases = Array.isArray(book.pdfPurchases) ? book.pdfPurchases : []
    const hasPurchasedPdf = userId && pdfPurchases.length > 0

    // Validate PDF file exists
    const pdfValidation = await validatePdfFile(book.pdfFile)
    const validPdfFile = pdfValidation.isValid ? book.pdfFile : null
    
    // Log warning if PDF is in DB but file doesn't exist
    if (book.pdfFile && !pdfValidation.exists) {
      console.warn(`PDF file not found for book ${book.id}: ${book.pdfFile}`)
    }

    return NextResponse.json({ 
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverImage: book.coverImage,
        pdfFile: validPdfFile,
        hasPurchasedPdf,
        year: book.year,
        genre: book.genre,
        status: book.status,
        chapters: chaptersWithLockStatus
      }
    })
  } catch (error) {
    console.error('Fetch book error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}
