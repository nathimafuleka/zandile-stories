import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    
    // Parse FormData for file upload
    const formData = await request.formData()
    const bookId = formData.get('bookId') as string
    const paymentReference = formData.get('paymentReference') as string
    const proofFile = formData.get('proofFile') as File | null

    if (!bookId || !paymentReference) {
      return NextResponse.json({ 
        message: 'Book ID and payment reference are required' 
      }, { status: 400 })
    }

    // Check if book exists and has PDF
    const book = await (prisma as any).book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, pdfFile: true }
    })

    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 })
    }

    if (!book.pdfFile) {
      return NextResponse.json({ 
        message: 'This book does not have a PDF version available' 
      }, { status: 400 })
    }

    // Check if user already purchased this PDF
    const existingPurchase = await (prisma as any).pdfPurchase.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId
        }
      }
    })

    if (existingPurchase) {
      return NextResponse.json({ 
        message: 'You have already purchased this PDF' 
      }, { status: 400 })
    }

    // Check if there's already a pending payment submission for this PDF
    const existingSubmission = await (prisma as any).paymentSubmission.findFirst({
      where: {
        userId,
        bookId,
        purchaseType: 'pdf',
        status: 'pending'
      }
    })

    if (existingSubmission) {
      return NextResponse.json({ 
        message: 'You already have a pending payment for this PDF' 
      }, { status: 400 })
    }

    // Handle file upload if provided
    let proofOfPaymentPath = null
    if (proofFile && proofFile.size > 0) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(proofFile.type)) {
        return NextResponse.json(
          { message: 'Invalid file type. Please upload PDF, JPG, or PNG only.' },
          { status: 400 }
        )
      }

      // Validate file size (max 5MB)
      if (proofFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'File size must be less than 5MB' },
          { status: 400 }
        )
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'proof-of-payments')
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = proofFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${userId}_${originalName}`
      const filepath = path.join(uploadsDir, filename)

      // Write file
      const bytes = await proofFile.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))

      // Store relative path
      proofOfPaymentPath = `/uploads/proof-of-payments/${filename}`
    }

    // Create payment submission
    const submission = await (prisma as any).paymentSubmission.create({
      data: {
        userId,
        bookId,
        purchaseType: 'pdf',
        paymentReference,
        proofOfPayment: proofOfPaymentPath,
        status: 'pending'
      }
    })

    return NextResponse.json({ 
      message: proofOfPaymentPath 
        ? 'Payment submitted with proof of payment.'
        : 'Payment submitted successfully',
      submission 
    }, { status: 201 })

  } catch (error: any) {
    console.error('PDF payment submission error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 })
  }
}
