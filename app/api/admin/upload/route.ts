import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'books')
    await mkdir(uploadsDir, { recursive: true })

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const fileExtension = file.name.split('.').pop()
    const filename = `book-${uniqueSuffix}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    const publicUrl = `/uploads/books/${filename}`

    return NextResponse.json({
      url: publicUrl,
      filename: filename
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: error.message || 'Upload failed' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
