'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, ChevronRight, Lock, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import BankTransferModal from './BankTransferModal'

interface Chapter {
  id: string
  title: string
  content: string
  isLocked?: boolean
}

interface Book {
  title: string
  author: string
  cover: string
  description: string
  chapters: Chapter[]
  pdfFile?: string | null
  hasPurchasedPdf?: boolean
  id?: string
  status?: string
}

export default function BookReader({ book }: { book: Book }) {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [showTableOfContents, setShowTableOfContents] = useState(true)
  const [showUnlockPopup, setShowUnlockPopup] = useState(false)
  const [showBankTransferModal, setShowBankTransferModal] = useState(false)
  const [showPdfPurchaseModal, setShowPdfPurchaseModal] = useState(false)
  const [lockedChapterToUnlock, setLockedChapterToUnlock] = useState<Chapter | null>(null)
  const [unlockPriceCard, setUnlockPriceCard] = useState(35)
  const [unlockPriceBank, setUnlockPriceBank] = useState(30)
  const [downloadPriceCard, setDownloadPriceCard] = useState(65)
  const [downloadPriceBank, setDownloadPriceBank] = useState(60)
  const [bankingDetails, setBankingDetails] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: '',
    accountType: ''
  })
  const [paymentReference, setPaymentReference] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank'>('card')

  const currentChapter = book.chapters.find(ch => ch.id === selectedChapter)

  // Prevent copy, paste, and keyboard shortcuts when chapter is selected
  useEffect(() => {
    if (!selectedChapter) return

    const preventCopy = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+U, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 's' || e.key === 'p' || e.key === 'u')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Inspect
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Console
        (e.ctrlKey && e.shiftKey && e.key === 'K') // Sources
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const preventSelect = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const preventPrint = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      alert('Printing is disabled for this content.')
    }

    // Add event listeners
    document.addEventListener('keydown', preventCopy, true)
    document.addEventListener('contextmenu', preventContextMenu, true)
    document.addEventListener('selectstart', preventSelect, true)
    document.addEventListener('copy', preventSelect, true)
    document.addEventListener('cut', preventSelect, true)
    window.addEventListener('beforeprint', preventPrint)

    // Disable text selection globally
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    ;(document.body.style as any).mozUserSelect = 'none'

    return () => {
      // Cleanup event listeners
      document.removeEventListener('keydown', preventCopy, true)
      document.removeEventListener('contextmenu', preventContextMenu, true)
      document.removeEventListener('selectstart', preventSelect, true)
      document.removeEventListener('copy', preventSelect, true)
      document.removeEventListener('cut', preventSelect, true)
      window.removeEventListener('beforeprint', preventPrint)
      
      // Restore text selection
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      ;(document.body.style as any).mozUserSelect = ''
    }
  }, [selectedChapter])

  // Fetch unlock prices and banking details from settings
  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setUnlockPriceCard(Number(data.settings.unlockChapterPriceCard || 35))
          setUnlockPriceBank(Number(data.settings.unlockChapterPriceBank || 30))
          setDownloadPriceCard(Number(data.settings.downloadPriceCard || 65))
          setDownloadPriceBank(Number(data.settings.downloadPriceBank || 60))
          setBankingDetails({
            bankName: data.settings.bankName || '',
            accountHolder: data.settings.accountHolder || '',
            accountNumber: data.settings.accountNumber || '',
            branchCode: data.settings.branchCode || '',
            accountType: data.settings.accountType || ''
          })
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err))
  })

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ backgroundColor: '#FCF8F7' }}>
      <div className="container mx-auto px-4 max-w-7xl">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Books
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-1 ${!showTableOfContents && 'hidden lg:block'}`}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="aspect-[3/4] rounded-lg mb-4 overflow-hidden">
                  {book.cover ? (
                    <img 
                      src={book.cover} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-sm text-gray-600 mb-4">by {book.author}</p>
                <p className="text-sm text-gray-700">{book.description}</p>
              </div>

              {/* PDF Purchase/Download Section - Only for completed books */}
              {book.pdfFile && book.status === 'completed' && (
                <div className="border-t border-gray-200 pt-6 pb-6">
                  {book.hasPurchasedPdf ? (
                    <a
                      href={book.pdfFile}
                      download
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          router.push('/login')
                          return
                        }
                        setShowPdfPurchaseModal(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Buy PDF - R{downloadPriceBank}
                    </button>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h2>
                <div className="space-y-2">
                  {book.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        if (!chapter.isLocked) {
                          setSelectedChapter(chapter.id)
                          setShowTableOfContents(false)
                        } else {
                          setLockedChapterToUnlock(chapter)
                          setShowUnlockPopup(true)
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedChapter === chapter.id
                          ? 'bg-red-50 text-red-600 font-semibold'
                          : chapter.isLocked
                          ? 'bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm flex items-center gap-2">
                        {chapter.isLocked && <Lock className="w-4 h-4" />}
                        {chapter.title}
                      </span>
                      {!chapter.isLocked && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {!selectedChapter ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hidden lg:block bg-white rounded-xl shadow-lg p-8 md:p-12"
                >
                  <div className="text-center max-w-2xl mx-auto">
                    <BookOpen className="w-20 h-20 text-red-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Welcome to {book.title}
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Select a chapter from the table of contents to start reading.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedChapter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg p-8 md:p-12"
                >
                  <div className="max-w-3xl mx-auto">
                    <button
                      onClick={() => setShowTableOfContents(true)}
                      className="lg:hidden mb-6 text-red-600 hover:text-red-700 font-semibold"
                    >
                      ← Table of Contents
                    </button>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                      {currentChapter?.title}
                    </h2>
                    
                    {currentChapter?.isLocked ? (
                      <div className="text-center py-12">
                        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">This Chapter is Locked</h3>
                        <p className="text-gray-600 mb-6">
                          Unlock this chapter to continue reading.
                        </p>
                        <div className="space-y-3">
                          <button className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            Pay with Card - R {unlockPriceCard}
                          </button>
                          <button 
                            onClick={() => {
                              setLockedChapterToUnlock(currentChapter)
                              setShowBankTransferModal(true)
                            }}
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            Bank Transfer - R {unlockPriceBank}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-lg max-w-none relative">
                        <div 
                          className="text-gray-800 text-left select-none"
                          style={{ 
                            lineHeight: '1.8', 
                            wordWrap: 'break-word', 
                            overflowWrap: 'break-word',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
                          onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                          onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
                          onCut={(e: React.ClipboardEvent) => e.preventDefault()}
                          onPaste={(e: React.ClipboardEvent) => e.preventDefault()}
                          onDragStart={(e: React.DragEvent) => e.preventDefault()}
                          onMouseDown={(e: React.MouseEvent) => {
                            if (e.detail > 1) e.preventDefault()
                          }}
                        />
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'transparent',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                        />
                      </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
                      <button
                        onClick={() => {
                          const currentIndex = book.chapters.findIndex(ch => ch.id === selectedChapter)
                          if (currentIndex > 0) {
                            setSelectedChapter(book.chapters[currentIndex - 1].id)
                          }
                        }}
                        disabled={book.chapters.findIndex(ch => ch.id === selectedChapter) === 0}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <button
                        onClick={() => {
                          const currentIndex = book.chapters.findIndex(ch => ch.id === selectedChapter)
                          if (currentIndex < book.chapters.length - 1) {
                            setSelectedChapter(book.chapters[currentIndex + 1].id)
                          }
                        }}
                        disabled={book.chapters.findIndex(ch => ch.id === selectedChapter) === book.chapters.length - 1}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Unlock Chapter Popup */}
      <AnimatePresence>
        {showUnlockPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUnlockPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${user ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {user ? (
                    <Lock className="w-8 h-8 text-red-600" />
                  ) : (
                    <LogIn className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {user ? 'Chapter Locked' : 'Login Required'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {user ? (
                    <>
                      Unlock "<strong>{lockedChapterToUnlock?.title}</strong>" to continue reading this amazing story.
                    </>
                  ) : (
                    <>
                      Please <strong>login or create an account</strong> to unlock and read "<strong>{lockedChapterToUnlock?.title}</strong>".
                    </>
                  )}
                </p>
                {user ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600 mb-3">Choose Payment Method</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setSelectedPaymentMethod('card')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedPaymentMethod === 'card'
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-xs text-gray-500 mb-1">Card Payment</p>
                          <p className={`text-2xl font-bold ${
                            selectedPaymentMethod === 'card' ? 'text-red-600' : 'text-gray-900'
                          }`}>R {unlockPriceCard}</p>
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMethod('bank')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedPaymentMethod === 'bank'
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-xs text-gray-500 mb-1">Bank Transfer</p>
                          <p className={`text-2xl font-bold ${
                            selectedPaymentMethod === 'bank' ? 'text-green-700' : 'text-gray-900'
                          }`}>R {unlockPriceBank}</p>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowUnlockPopup(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowUnlockPopup(false)
                          if (selectedPaymentMethod === 'bank') {
                            setShowBankTransferModal(true)
                          } else {
                            // TODO: Implement card payment logic
                            alert('Card payment integration coming soon!')
                          }
                        }}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                      >
                        Unlock Now
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowUnlockPopup(false)
                        router.push('/login')
                      }}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-5 h-5" />
                      Login to Unlock
                    </button>
                    <button
                      onClick={() => {
                        setShowUnlockPopup(false)
                        router.push('/register')
                      }}
                      className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => setShowUnlockPopup(false)}
                      className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Transfer Modal */}
      <BankTransferModal
        isOpen={showBankTransferModal}
        onClose={() => {
          setShowBankTransferModal(false)
          setPaymentReference('')
        }}
        chapterTitle={lockedChapterToUnlock?.title || ''}
        amount={unlockPriceBank}
        bankingDetails={bankingDetails}
        onSubmit={async (proofFile) => {
          try {
            const token = localStorage.getItem('token')
            if (!token || !lockedChapterToUnlock) {
              alert('Please login to continue')
              return
            }

            if (!proofFile) {
              alert('Please upload your proof of payment')
              return
            }

            // Use FormData for file upload
            const formData = new FormData()
            formData.append('chapterId', lockedChapterToUnlock.id)
            formData.append('paymentReference', 'POP_UPLOADED') // Placeholder since we only use POP now
            formData.append('proofFile', proofFile)

            const response = await fetch('/api/payments/submit', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            })

            const data = await response.json()

            if (response.ok) {
              setShowBankTransferModal(false)
              alert('Payment submitted! Admin will verify and unlock your chapter soon.')
            } else {
              alert(data.message || 'Failed to submit payment')
            }
          } catch (error) {
            console.error('Payment submission error:', error)
            alert('Failed to submit payment. Please try again.')
          }
        }}
      />

      {/* PDF Purchase Modal */}
      <AnimatePresence>
        {showPdfPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPdfPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Purchase PDF
                </h3>
                <p className="text-gray-600 mb-6">
                  Get "<strong>{book.title}</strong>" as a downloadable PDF.
                </p>

                <p className="text-sm text-gray-700 font-medium mb-4">Choose Payment Method</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPaymentMethod === 'card'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 mb-1">Card Payment</p>
                      <p className="text-2xl font-bold text-red-600">R {downloadPriceCard}</p>
                      <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('bank')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPaymentMethod === 'bank'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 mb-1">Bank Transfer</p>
                      <p className="text-2xl font-bold text-red-600">R {downloadPriceBank}</p>
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPdfPurchaseModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfPurchaseModal(false)
                      if (selectedPaymentMethod === 'bank') {
                        setShowBankTransferModal(true)
                      } else {
                        alert('Card payment integration coming soon!')
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Transfer Modal for PDF */}
      {!showPdfPurchaseModal && (
        <BankTransferModal
          isOpen={showBankTransferModal && !lockedChapterToUnlock}
          onClose={() => {
            setShowBankTransferModal(false)
            setPaymentReference('')
          }}
          chapterTitle={`${book.title} - Full PDF`}
          amount={downloadPriceBank}
          bankingDetails={bankingDetails}
          onSubmit={async (proofFile) => {
            try {
              const token = localStorage.getItem('token')
              if (!token || !book.id) {
                alert('Please login to continue')
                return
              }

              if (!proofFile) {
                alert('Please upload your proof of payment')
                return
              }

              // Use FormData for file upload
              const formData = new FormData()
              formData.append('bookId', book.id)
              formData.append('paymentReference', 'POP_UPLOADED') // Placeholder since we only use POP now
              formData.append('proofFile', proofFile)

              const response = await fetch('/api/payments/submit-pdf', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              })

              const data = await response.json()

              if (response.ok) {
                setShowBankTransferModal(false)
                alert('Payment submitted! Admin will verify and you can download the PDF soon.')
              } else {
                alert(data.message || 'Failed to submit payment')
              }
            } catch (error) {
              console.error('Payment submission error:', error)
              alert('Failed to submit payment. Please try again.')
            }
          }}
        />
      )}
    </div>
  )
}
