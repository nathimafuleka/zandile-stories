'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Save, Trash2, Edit, Check, X, GripVertical, Lock, Unlock, Upload } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

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
}

export default function ChapterManagementPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const { showToast } = useToast()

  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
    order: 1
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    content: ''
  })
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [processingPdf, setProcessingPdf] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchBookAndChapters()
  }, [bookId])

  const fetchBookAndChapters = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch book')

      const data = await response.json()
      setBook({ id: data.book.id, title: data.book.title })
      setChapters(data.book.chapters || [])
      setNewChapter(prev => ({ ...prev, order: (data.book.chapters?.length || 0) + 1 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const isPrologue = newChapter.title.toLowerCase().includes('prologue') || newChapter.order === 1
      const response = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId,
          ...newChapter,
          isLocked: !isPrologue
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create chapter')
      }

      const data = await response.json()
      setChapters([...chapters, data.chapter])
      setNewChapter({
        title: '',
        content: '',
        order: newChapter.order + 1
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditChapter = async (chapterId: string) => {
    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const chapter = chapters.find(ch => ch.id === chapterId)
      if (!chapter) return

      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editForm,
          order: chapter.order
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update chapter')
      }

      const data = await response.json()
      setChapters(chapters.map(ch => ch.id === chapterId ? data.chapter : ch))
      setEditingId(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, chapterId: string) => {
    setDraggedChapterId(chapterId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetChapterId: string) => {
    e.preventDefault()
    
    if (!draggedChapterId || draggedChapterId === targetChapterId) {
      setDraggedChapterId(null)
      return
    }

    const draggedIndex = chapters.findIndex(ch => ch.id === draggedChapterId)
    const targetIndex = chapters.findIndex(ch => ch.id === targetChapterId)

    const items = Array.from(chapters)
    const [reorderedItem] = items.splice(draggedIndex, 1)
    items.splice(targetIndex, 0, reorderedItem)

    const updatedChapters = items.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }))

    setChapters(updatedChapters)
    setDraggedChapterId(null)

    try {
      const token = localStorage.getItem('adminToken')
      await Promise.all(
        updatedChapters.map(chapter =>
          fetch(`/api/admin/chapters/${chapter.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: chapter.title,
              content: chapter.content,
              order: chapter.order
            })
          })
        )
      )
    } catch (err: any) {
      setError('Failed to update chapter order')
      fetchBookAndChapters()
    }
  }

  const handleDragEnd = () => {
    setDraggedChapterId(null)
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
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleBulkChapterLock = async (lock: boolean) => {
    const action = lock ? 'lock' : 'unlock'
    if (!confirm(`Are you sure you want to ${action} all chapters for this book?`)) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}/chapters/bulk-lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lock })
      })

      if (!response.ok) throw new Error(`Failed to ${action} chapters`)

      const data = await response.json()
      
      // Update local chapters state - keep prologue unlocked when locking
      setChapters(chapters.map(ch => {
        if (lock && ch.title.toLowerCase().includes('prologue')) {
          return ch // Keep prologue as-is (unlocked)
        }
        return { ...ch, isLocked: lock }
      }))
      
      showToast(data.message, 'success')
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error')
    }
  }

  const startEditing = (chapter: Chapter) => {
    setEditingId(chapter.id)
    setEditForm({
      title: chapter.title,
      content: chapter.content
    })
  }

  const selectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId)
    const chapter = chapters.find(ch => ch.id === chapterId)
    if (chapter && editingId !== chapterId) {
      setEditForm({
        title: chapter.title,
        content: chapter.content
      })
    }
  }

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setPdfFile(file)
    setError('')
  }

  const handleProcessPdf = async () => {
    if (!pdfFile) return

    setProcessingPdf(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)

      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to process PDF')
      }

      const data = await response.json()
      showToast(data.message, 'success')
      await fetchBookAndChapters()
      setPdfFile(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingPdf(false)
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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <h1 
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              Manage Chapters: {book?.title}
            </h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Finish & Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Existing Chapters */}
          <div className="col-span-12 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-4"
              style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chapters ({chapters.length})</h2>
              </div>

              {chapters.length > 0 && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleBulkChapterLock(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Unlock className="w-4 h-4" />
                    Unlock All
                  </button>
                  <button
                    onClick={() => handleBulkChapterLock(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Lock All
                  </button>
                </div>
              )}

              {chapters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No chapters yet</p>
                  <p className="text-xs mt-1">Add your first chapter →</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.sort((a, b) => a.order - b.order).map((chapter) => (
                    <div
                      key={chapter.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, chapter.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, chapter.id)}
                      onDragEnd={handleDragEnd}
                      className={`border rounded-lg p-3 transition-all cursor-move ${
                        draggedChapterId === chapter.id
                          ? 'opacity-50 bg-gray-100 border-gray-400'
                          : selectedChapterId === chapter.id
                          ? 'bg-red-50 border-red-300'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <button
                              type="button"
                              onClick={() => selectChapter(chapter.id)}
                              className="text-left flex-1 min-w-0"
                            >
                              <span className="text-xs font-semibold text-gray-500">Ch {chapter.order}</span>
                              <h3 className="font-semibold text-gray-900 truncate text-sm">
                                {chapter.title}
                              </h3>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {chapter.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                selectChapter(chapter.id)
                                startEditing(chapter)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="flex-1"></div>
                            <div className="flex items-center gap-1">
                              {chapter.isLocked ? (
                                <div title="Locked">
                                  <Lock className="w-3 h-3 text-gray-400" />
                                </div>
                              ) : (
                                <div title="Unlocked">
                                  <Unlock className="w-3 h-3 text-green-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>💡 Drag chapters to reorder</p>
                <p>Click to view/edit on the right →</p>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Add/Edit Chapter */}
          <div className="col-span-12 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-8"
            >
              {editingId ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Chapter</h2>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleEditChapter(editingId); }} className="space-y-6">
                    <div>
                      <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                        Chapter Title *
                      </label>
                      <input
                        id="edit-title"
                        type="text"
                        required
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter chapter title"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-2">
                        Chapter Content * (Paste from Word to preserve formatting)
                      </label>
                      <div
                        id="edit-content"
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => setEditForm({ ...editForm, content: e.currentTarget.innerHTML })}
                        dangerouslySetInnerHTML={{ __html: editForm.content }}
                        className="w-full min-h-[500px] px-8 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-base overflow-y-auto"
                        style={{ 
                          fontFamily: 'inherit', 
                          lineHeight: '1.8', 
                          wordWrap: 'break-word',
                          maxWidth: '100%',
                          margin: '0 auto'
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Paste content from Word to preserve bold, italic, and other formatting
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  {/* PDF Upload Section */}
                  <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      Upload PDF to Extract Chapter Titles
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a PDF and click Process to extract chapter titles. The system will create chapters in the sidebar for you to add content manually.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfFileSelect}
                            disabled={processingPdf}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
                          />
                        </label>
                      </div>
                      {pdfFile && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 p-3 bg-white rounded-lg border border-blue-300">
                            <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                            <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            onClick={handleProcessPdf}
                            disabled={processingPdf}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {processingPdf ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              'Process PDF'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or add chapter manually</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Chapter</h2>
                  
                  <form onSubmit={handleAddChapter} className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Chapter Title *
                      </label>
                      <input
                        id="title"
                        type="text"
                        required
                        value={newChapter.title}
                        onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter chapter title"
                      />
                    </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Content * (Paste from Word to preserve formatting)
                  </label>
                  <div
                    id="content"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setNewChapter({ ...newChapter, content: e.currentTarget.innerHTML })}
                    dangerouslySetInnerHTML={{ __html: newChapter.content }}
                    className="w-full min-h-[300px] px-8 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-base overflow-y-auto"
                    style={{ 
                      fontFamily: 'inherit', 
                      lineHeight: '1.8', 
                      wordWrap: 'break-word',
                      maxWidth: '100%',
                      margin: '0 auto'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste content from Word to preserve bold, italic, and other formatting
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  {saving ? 'Adding...' : 'Add Chapter'}
                </button>
              </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
