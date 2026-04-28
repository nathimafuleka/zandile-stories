'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2, Plus, Edit, FileText, Upload, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface Chapter {
  id: string
  title: string
  order: number
  content: string
}

interface Book {
  id: string
  title: string
  description: string
  coverImage: string | null
  pdfFile: string | null
  year: string | null
  genre: string | null
  status: string
  releaseDate: string | null
  chapters: Chapter[]
}

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    pdfFile: '',
    year: '',
    genre: '',
    status: 'completed',
    releaseDate: ''
  })
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [error, setError] = useState('')
  const [useUrl, setUseUrl] = useState(true)
  const [usePdfUrl, setUsePdfUrl] = useState(true)

  useEffect(() => {
    fetchBook()
  }, [bookId])

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch book')

      const data = await response.json()
      const book: Book = data.book

      setFormData({
        title: book.title,
        description: book.description,
        coverImage: book.coverImage || '',
        pdfFile: book.pdfFile || '',
        year: book.year || '',
        genre: book.genre || '',
        status: book.status,
        releaseDate: book.releaseDate ? new Date(book.releaseDate).toISOString().slice(0, 16) : ''
      })
      setChapters(book.chapters || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, coverImage: data.url }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file')
      return
    }

    setUploadingPdf(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'PDF upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, pdfFile: data.url }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update book')
      }

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBook = async () => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete book')

      router.push('/admin/dashboard')
      showToast('Book updated successfully!', 'success')
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete chapter')

      setChapters(chapters.filter(ch => ch.id !== chapterId))
      showToast('Chapter deleted successfully', 'success')
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FCF8F7' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCF8F7' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              Edit Book
            </h1>
            <div className="grid grid-cols-1 sm:flex sm:gap-3 gap-3">
              <button
                onClick={() => router.push(`/admin/books/${bookId}/chapters`)}
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg sm:shadow-none"
              >
                <Plus className="w-5 h-5" />
                <span>Manage Chapters</span>
              </button>
              <button
                onClick={handleDeleteBook}
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold shadow-lg sm:shadow-none"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Book</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Book Details</h2>

              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <input
                      id="genre"
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      id="year"
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUseUrl(true)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        useUrl 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Use URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseUrl(false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        !useUrl 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                  </div>

                  {useUrl ? (
                    <input
                      id="coverImage"
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="/uploads/books/cover.jpg or https://example.com/cover.jpg"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                      <input
                        type="file"
                        id="fileUpload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="fileUpload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload a PDF version of the book that users can purchase and download
                  </p>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUsePdfUrl(true)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        usePdfUrl 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Use URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePdfUrl(false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        !usePdfUrl 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="pdfFile"
                      type="text"
                      value={formData.pdfFile}
                      onChange={(e) => setFormData({ ...formData, pdfFile: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="/uploads/books/book.pdf or https://example.com/book.pdf"
                    />
                    {formData.pdfFile && (
                      <a 
                        href={formData.pdfFile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        Preview
                      </a>
                    )}
                  </div>

                  {!usePdfUrl && (
                    <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                      <input
                        type="file"
                        id="pdfUpload"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        disabled={uploadingPdf}
                      />
                      <label
                        htmlFor="pdfUpload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {uploadingPdf ? 'Uploading PDF...' : 'Click to upload PDF file'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF files only, up to 50MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                {formData.status === 'coming_soon' && (
                  <div>
                    <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Release Date *
                    </label>
                    <input
                      id="releaseDate"
                      type="datetime-local"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:flex gap-3 sm:gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-lg sm:shadow-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:shadow-none"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chapters</h2>
                <span className="text-sm text-gray-600">{chapters.length} total</span>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No chapters yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters.sort((a, b) => a.order - b.order).map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chapter.order}. {chapter.title}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {formData.coverImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6 mt-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Preview</h2>
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23ddd" width="200" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid URL%3C/text%3E%3C/svg%3E'
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
