import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Parse FormData for file upload
    const formData = await request.formData()
    const chapterId = formData.get('chapterId') as string
    const paymentReference = formData.get('paymentReference') as string
    const proofFile = formData.get('proofFile') as File | null

    if (!chapterId || !paymentReference) {
      return NextResponse.json(
        { message: 'Chapter ID and payment reference are required' },
        { status: 400 }
      )
    }

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: true }
    })

    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }

    // Check if user already has a pending submission for this chapter
    const existingSubmission = await prisma.paymentSubmission.findFirst({
      where: {
        userId: decoded.userId,
        chapterId: chapterId,
        status: 'pending'
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { message: 'You already have a pending payment submission for this chapter' },
        { status: 400 }
      )
    }

    // Check if chapter is already unlocked for user
    const existingUnlock = await prisma.chapterUnlock.findUnique({
      where: {
        userId_chapterId: {
          userId: decoded.userId,
          chapterId: chapterId
        }
      }
    })

    if (existingUnlock) {
      return NextResponse.json(
        { message: 'This chapter is already unlocked for you' },
        { status: 400 }
      )
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
      const filename = `${timestamp}_${decoded.userId}_${originalName}`
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
        userId: decoded.userId,
        chapterId: chapterId,
        paymentReference: paymentReference.trim(),
        proofOfPayment: proofOfPaymentPath,
        status: 'pending'
      }
    })

    return NextResponse.json({
      message: proofOfPaymentPath 
        ? 'Payment submitted with proof of payment. Admin will verify and unlock your chapter.'
        : 'Payment submission received. Admin will verify and unlock your chapter.',
      submission
    })

  } catch (error: any) {
    console.error('Payment submission error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to submit payment' },
      { status: 500 }
    )
  }
}
