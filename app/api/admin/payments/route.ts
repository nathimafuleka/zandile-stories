import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Fetch payment submissions with user and chapter details
    const submissions = await (prisma as any).paymentSubmission.findMany({
      where: status !== 'all' ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        chapter: {
          select: {
            id: true,
            title: true,
            order: true,
            book: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get settings for pricing
    const settings = await prisma.settings.findFirst()
    const chapterPrice = (settings as any)?.unlockChapterPriceBank || 30
    const pdfPriceBank = (settings as any)?.downloadPriceBank || 60
    const pdfPriceCard = (settings as any)?.downloadPriceCard || 65

    // Get unique book IDs for PDF purchases
    const pdfBookIds = submissions
      .filter((sub: any) => sub.purchaseType === 'pdf' && sub.bookId)
      .map((sub: any) => sub.bookId)
    
    // Fetch books for PDF purchases
    const books = pdfBookIds.length > 0 
      ? await prisma.book.findMany({
          where: { id: { in: pdfBookIds } },
          select: { id: true, title: true }
        })
      : []
    
    const bookMap = new Map(books.map(b => [b.id, b]))

    // Transform data to include user and chapter info at top level
    const transformedSubmissions = submissions.map((sub: any) => {
      const isPdfPurchase = sub.purchaseType === 'pdf'
      const pdfBook = isPdfPurchase && sub.bookId ? bookMap.get(sub.bookId) : null
      
      return {
        id: sub.id,
        userId: sub.userId,
        userName: sub.user?.name || 'Unknown',
        userEmail: sub.user?.email || 'N/A',
        chapterId: sub.chapterId,
        chapterTitle: isPdfPurchase ? '' : (sub.chapter?.title || 'Unknown Chapter'),
        chapterOrder: isPdfPurchase ? 0 : (sub.chapter?.order || 0),
        bookTitle: isPdfPurchase ? (pdfBook?.title || 'Unknown Book') : (sub.chapter?.book?.title || 'Unknown Book'),
        bookId: isPdfPurchase ? (sub.bookId || '') : (sub.chapter?.book?.id || ''),
        paymentReference: sub.paymentReference,
        proofOfPayment: sub.proofOfPayment,
        purchaseType: sub.purchaseType || 'chapter',
        price: isPdfPurchase ? pdfPriceBank : chapterPrice,
        status: sub.status,
        adminNote: sub.adminNote,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt
      }
    })

    return NextResponse.json({
      submissions: transformedSubmissions,
      count: transformedSubmissions.length
    })

  } catch (error: any) {
    console.error('Fetch payments error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch payment submissions' },
      { status: 500 }
    )
  }
}
