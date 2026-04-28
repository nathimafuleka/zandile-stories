import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    verifyAdminToken(token)

    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return NextResponse.json(
        { message: 'No PDF file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Save PDF temporarily for parsing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempPath = join(process.cwd(), 'public', 'temp', `${Date.now()}-${file.name}`)
    
    await writeFile(tempPath, buffer)
    
    // Extract text from PDF using Python script
    let extractedChapters: Array<{title: string, content: string}> = []
    let totalPages = 0
    
    try {
      const scriptPath = join(process.cwd(), 'scripts', 'extract_pdf.py')
      console.log('=== PYTHON SCRIPT EXECUTION ===')
      console.log('Script path:', scriptPath)
      console.log('PDF path:', tempPath)
      console.log('Current working directory:', process.cwd())
      
      // Execute Python script
      const pythonResult = await new Promise<{success: boolean, chapters?: any[], error?: string, total_pages?: number}>((resolve, reject) => {
        console.log('Spawning Python process...')
        const python = spawn('python', [scriptPath, tempPath, 'true'])
        let output = ''
        let errorOutput = ''
        
        python.stdout.on('data', (data) => {
          output += data.toString()
        })
        
        python.stderr.on('data', (data) => {
          errorOutput += data.toString()
        })
        
        python.on('close', (code) => {
          if (code !== 0) {
            console.error('Python process failed with code:', code)
            console.error('Error output:', errorOutput)
            reject(new Error(`Python script failed with code ${code}: ${errorOutput}`))
          } else {
            try {
              const result = JSON.parse(output)
              resolve(result)
            } catch (e) {
              console.error('Failed to parse JSON:', e)
              reject(new Error(`Failed to parse Python output`))
            }
          }
        })
        
        python.on('error', (err) => {
          console.error('Python spawn error:', err)
          reject(new Error(`Failed to spawn Python process: ${err.message}`))
        })
      })
      
      // Clean up temp file
      await unlink(tempPath)
      
      if (!pythonResult.success) {
        return NextResponse.json({ 
          message: `PDF extraction failed: ${pythonResult.error}`,
          chapters: []
        }, { status: 500 })
      }
      
      extractedChapters = pythonResult.chapters || []
      totalPages = pythonResult.total_pages || 0
      
      console.log(`\n✓ Extracted ${extractedChapters.length} chapters from PDF`)

      if (extractedChapters.length === 0) {
        return NextResponse.json({ 
          message: 'No chapter markers found in PDF. Please add chapters manually or ensure your PDF has chapter headings like "Prologue", "Chapter 1", "Chapter One", etc.',
          chapters: []
        }, { status: 400 })
      }

      // Get all existing chapters for this book
      const existingChapters = await prisma.chapter.findMany({
        where: { bookId: params.id },
        orderBy: { order: 'asc' }
      })
      
      // Create a map of existing chapter titles for quick lookup
      const existingTitles = new Set(existingChapters.map(ch => ch.title))
      
      const chapters = []
      const skippedChapters = []
      let nextOrder = existingChapters.length > 0 
        ? Math.max(...existingChapters.map(ch => ch.order)) + 1 
        : 1
      
      // Process each extracted chapter
      for (const extractedChapter of extractedChapters) {
        const chapterTitle = extractedChapter.title
        const chapterContent = extractedChapter.content

        // Check if chapter already exists
        if (existingTitles.has(chapterTitle)) {
          skippedChapters.push(chapterTitle)
          continue
        }

        // Create new chapter with title and content from Python extraction
        const chapter = await prisma.chapter.create({
          data: {
            bookId: params.id,
            title: chapterTitle,
            content: chapterContent, // HTML-formatted content from Python script
            order: nextOrder,
            isLocked: nextOrder > 1
          }
        })

        chapters.push(chapter)
        nextOrder++
      }
      
      console.log(`✓ Created ${chapters.length} new chapters${skippedChapters.length > 0 ? `, skipped ${skippedChapters.length} existing` : ''}`)

      const message = chapters.length > 0
        ? `Successfully created ${chapters.length} new chapter(s). ${skippedChapters.length > 0 ? `Skipped ${skippedChapters.length} existing chapter(s).` : ''}`
        : `All ${extractedChapters.length} chapters already exist. No new chapters created.`
      
      return NextResponse.json({ 
        message,
        created: chapters.length,
        skipped: skippedChapters.length,
        chapters 
      })
      
    } catch (error: any) {
      console.error('PDF text extraction error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      // Try to clean up temp file
      try {
        await unlink(tempPath)
      } catch {}
      
      return NextResponse.json({ 
        message: `Failed to extract text from PDF: ${error.message}`,
        chapters: []
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('PDF upload error:', error)
    console.error('Error message:', error.message)
    return NextResponse.json(
      { message: error.message || 'Failed to process PDF' },
      { status: error.message === 'No token provided' || error.message === 'Invalid or expired token' ? 401 : 500 }
    )
  }
}
