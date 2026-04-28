'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Lock, Unlock, Users, Check, Book } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface User {
  id: string
  name: string
  email: string
}

interface BookType {
  id: string
  title: string
}

interface Chapter {
  id: string
  title: string
  order: number
  isLocked: boolean
  bookTitle: string
  bookId: string
}

export default function ChapterUnlocksPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [books, setBooks] = useState<BookType[]>([])
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [chapterToUnlock, setChapterToUnlock] = useState<Chapter | null>(null)
  const [showAllBooks, setShowAllBooks] = useState(false)
  const BOOKS_DISPLAY_LIMIT = 6

  useEffect(() => {
    checkAuth()
    fetchUsers()
    fetchBooks()
  }, [])

  useEffect(() => {
    if (selectedBook) {
      fetchChapters()
    }
  }, [selectedBook])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/books', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch books')

      const data = await response.json()
      setBooks(data.books)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchChapters = async () => {
    if (!selectedBook) {
      setChapters([])
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/chapters/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch chapters')

      const data = await response.json()
      // Filter chapters by selected book
      const filteredChapters = data.chapters.filter((ch: Chapter) => ch.bookId === selectedBook.id)
      setChapters(filteredChapters)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleChapterSelection = (chapterId: string) => {
    if (selectedChapters.includes(chapterId)) {
      setSelectedChapters(selectedChapters.filter(id => id !== chapterId))
    } else {
      setSelectedChapters([...selectedChapters, chapterId])
    }
  }

  const handleUnlockForUser = async () => {
    if (!selectedUser || selectedChapters.length === 0) return

    setProcessing(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      
      for (const chapterId of selectedChapters) {
        const response = await fetch(`/api/admin/chapters/${chapterId}/unlock-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userEmail: selectedUser.email
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Failed to unlock chapter')
        }
      }

      showToast(`Successfully unlocked ${selectedChapters.length} chapter(s) for ${selectedUser.name}`, 'success')
      setSelectedChapters([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleUnlockForAll = async (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    
    setChapterToUnlock(chapter)
    setShowConfirmModal(true)
  }

  const confirmUnlockForAll = async () => {
    if (!chapterToUnlock) return

    setProcessing(true)
    setShowConfirmModal(false)
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/chapters/${chapterToUnlock.id}/lock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isLocked: false
        })
      })

      if (!response.ok) throw new Error('Failed to unlock chapter')

      setChapters(chapters.map(ch =>
        ch.id === chapterToUnlock.id ? { ...ch, isLocked: false } : ch
      ))
      setChapterToUnlock(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FCF8F7' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCF8F7' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chapter Unlock Management</h1>
          <p className="text-gray-600 mt-1">Assign chapters to specific users or unlock for everyone</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Book Selection */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-600" />
            Select Book
          </h2>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-8">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No books found matching "{bookSearchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(showAllBooks || bookSearchQuery ? filteredBooks : filteredBooks.slice(0, BOOKS_DISPLAY_LIMIT)).map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book)
                      setSelectedChapters([])
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedBook?.id === book.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    {selectedBook?.id === book.id && (
                      <p className="text-xs text-purple-600 mt-1">✓ Selected</p>
                    )}
                  </button>
                ))}
              </div>
              {!showAllBooks && !bookSearchQuery && filteredBooks.length > BOOKS_DISPLAY_LIMIT && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllBooks(true)}
                    className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-sm"
                  >
                    Show All Books ({filteredBooks.length})
                  </button>
                </div>
              )}
            </>
          )}
          {!selectedBook && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Please select a book to view its chapters
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Selection Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Select User
              </h2>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </button>
                ))}
              </div>

              {selectedUser && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900">Selected:</p>
                  <p className="text-sm text-blue-700">{selectedUser.name}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Chapter Selection Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Book className="w-5 h-5 text-purple-600" />
                  Select Chapters
                  {selectedBook && <span className="text-sm font-normal text-gray-600">from {selectedBook.title}</span>}
                </h2>
                <div className="text-sm text-gray-600">
                  {selectedChapters.length} selected
                </div>
              </div>

              {!selectedBook ? (
                <div className="text-center py-12">
                  <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Please select a book first to view its chapters</p>
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No chapters found for this book</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter.id)}
                        onChange={() => toggleChapterSelection(chapter.id)}
                        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              Ch {chapter.order}: {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-600">{chapter.bookTitle}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {chapter.isLocked ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                Unlocked
                              </span>
                            )}
                            <button
                              onClick={() => handleUnlockForAll(chapter.id)}
                              disabled={!chapter.isLocked || processing}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              Unlock for All
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {selectedBook && chapters.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleUnlockForUser}
                    disabled={!selectedUser || selectedChapters.length === 0 || processing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    {processing ? 'Processing...' : `Unlock ${selectedChapters.length} Chapter(s) for ${selectedUser?.name || 'User'}`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && chapterToUnlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Unlock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock for All Users?</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to unlock this chapter for <strong>everyone</strong>?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    Ch {chapterToUnlock.order}: {chapterToUnlock.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{chapterToUnlock.bookTitle}</p>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  This will make the chapter free for all users to read.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false)
                      setChapterToUnlock(null)
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUnlockForAll}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                  >
                    Unlock for All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
