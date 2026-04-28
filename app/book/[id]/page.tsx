'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookReader from '@/components/BookReader'

interface Chapter {
  id: string
  title: string
  content: string
  order: number
  isLocked: boolean
}

interface Book {
  id: string
  title: string
  author: string
  description: string
  coverImage: string | null
  pdfFile: string | null
  hasPurchasedPdf: boolean
  year: string | null
  genre: string | null
  status: string
  chapters: Chapter[]
}

export default function BookDetailPage() {
  const params = useParams()
  const bookId = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBook()
  }, [bookId])

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/books/${bookId}`, { headers })
      
      if (!response.ok) {
        throw new Error('Book not found')
      }

      const data = await response.json()
      setBook(data.book)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-24" style={{ backgroundColor: '#FCF8F7' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600">Loading book...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !book) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-24" style={{ backgroundColor: '#FCF8F7' }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h1>
            <p className="text-gray-600 mb-6">{error || 'The book you are looking for does not exist.'}</p>
            <a href="/" className="text-red-600 hover:text-red-700 font-semibold">
              Return to Home
            </a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <BookReader book={{
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.coverImage || '/assets/images/default-book-cover.jpg',
        description: book.description,
        pdfFile: book.pdfFile,
        hasPurchasedPdf: book.hasPurchasedPdf,
        status: book.status,
        chapters: book.chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          content: ch.content,
          isLocked: ch.isLocked
        }))
      }} />
      <Footer />
    </>
  )
}
