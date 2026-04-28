import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }

    const { action, adminNote } = await request.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get the payment submission
    const submission = await (prisma as any).paymentSubmission.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        chapter: {
          include: {
            book: true
          }
        }
      } as any
    })

    if (!submission) {
      return NextResponse.json({ message: 'Payment submission not found' }, { status: 404 })
    }

    // Determine if this is a PDF purchase or chapter unlock
    const isPdfPurchase = submission.purchaseType === 'pdf'
    
    // Fetch book data for PDF purchases
    let pdfBook = null
    if (isPdfPurchase && submission.bookId) {
      pdfBook = await prisma.book.findUnique({
        where: { id: submission.bookId },
        select: { id: true, title: true }
      })
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { message: `This payment has already been ${submission.status}` },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Get settings to determine the price
      const settings = await prisma.settings.findFirst()
      
      if (isPdfPurchase) {
        // Handle PDF purchase approval
        const downloadPrice = (settings as any)?.downloadPriceBank || 60

        // Check if user already purchased this PDF
        const existingPurchase = await (prisma as any).pdfPurchase.findUnique({
          where: {
            userId_bookId: {
              userId: submission.userId,
              bookId: submission.bookId
            }
          }
        })

        if (!existingPurchase) {
          // Create PDF purchase record
          await (prisma as any).pdfPurchase.create({
            data: {
              userId: submission.userId,
              bookId: submission.bookId
            }
          })
          console.log('Created PdfPurchase for user:', submission.userId)
        } else {
          console.log('PdfPurchase already exists:', existingPurchase)
        }

        // Create transaction record for finance tracking
        await prisma.transaction.create({
          data: {
            amount: downloadPrice,
            type: 'sale',
            description: `PDF purchase: ${pdfBook?.title || 'Unknown Book'}`,
            bookId: submission.bookId,
            userId: submission.userId,
            status: 'completed',
            paymentMethod: 'bank'
          }
        })
      } else {
        // Handle chapter unlock approval
        const unlockPrice = settings?.unlockChapterPriceBank || 30

        // Check if chapter is already unlocked
        const existingUnlock = await prisma.chapterUnlock.findUnique({
          where: {
            userId_chapterId: {
              userId: submission.userId,
              chapterId: submission.chapterId
            }
          }
        })

        if (!existingUnlock) {
          // Unlock the chapter for the user
          const unlock = await prisma.chapterUnlock.create({
            data: {
              userId: submission.userId,
              chapterId: submission.chapterId
            }
          })
          console.log('Created ChapterUnlock:', unlock)
        } else {
          console.log('ChapterUnlock already exists:', existingUnlock)
        }

        // Create transaction record for finance tracking
        await prisma.transaction.create({
          data: {
            amount: unlockPrice,
            type: 'sale',
            description: `Chapter unlock: ${submission.chapter.title} - ${submission.chapter.book.title}`,
            bookId: submission.chapter.book.id,
            userId: submission.userId,
            status: 'completed',
            paymentMethod: 'bank'
          }
        })
      }

      // Update submission status
      const updatedSubmission = await (prisma as any).paymentSubmission.update({
        where: { id: params.id },
        data: {
          status: 'approved',
          adminNote: adminNote || (isPdfPurchase ? 'Payment verified and PDF unlocked' : 'Payment verified and chapter unlocked')
        }
      })

      return NextResponse.json({
        message: 'Payment approved and chapter unlocked for user',
        submission: updatedSubmission
      })

    } else {
      // Reject payment
      const updatedSubmission = await (prisma as any).paymentSubmission.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          adminNote: adminNote || 'Payment could not be verified'
        }
      })

      return NextResponse.json({
        message: 'Payment submission rejected',
        submission: updatedSubmission
      })
    }

  } catch (error: any) {
    console.error('Payment action error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}
