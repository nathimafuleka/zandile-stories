'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Book, FileText, HelpCircle, Mail, User, Home, CreditCard, Download, Lock, MessageCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface BookResult {
  id: string
  title: string
  description: string
  coverImage: string | null
  genre: string | null
  year: string | null
  status?: string
}

interface ChapterResult {
  id: string
  title: string
  bookId: string
  bookTitle: string
  content: string
}

interface PageResult {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Static pages that can be searched
const staticPages: PageResult[] = [
  {
    title: 'Home',
    description: 'Browse all books, coming soon releases, and learn about the author',
    href: '/',
    icon: <Home className="w-5 h-5" />,
    category: 'Pages'
  },
  {
    title: 'FAQ',
    description: 'Find answers to common questions about reading, payments, account management, and more',
    href: '/faq',
    icon: <HelpCircle className="w-5 h-5" />,
    category: 'Pages'
  },
  {
    title: 'Contact Us',
    description: 'Get in touch with us for support, feedback, or general inquiries. Email, WhatsApp, and contact form available',
    href: '/contact',
    icon: <Mail className="w-5 h-5" />,
    category: 'Pages'
  },
  {
    title: 'Login',
    description: 'Sign in to your account to unlock chapters and track your reading progress',
    href: '/login',
    icon: <User className="w-5 h-5" />,
    category: 'Account'
  },
  {
    title: 'Register',
    description: 'Create a new account to start reading and unlock premium chapters',
    href: '/register',
    icon: <User className="w-5 h-5" />,
    category: 'Account'
  }
]

// Smart FAQ suggestions with keywords
interface FAQSuggestion {
  question: string
  href: string
  keywords: string[]
  icon: React.ReactNode
}

// Natural language query patterns
interface IntentPattern {
  patterns: string[]
  response: {
    title: string
    description: string
    href: string
    icon: React.ReactNode
  }
}

const faqSuggestions: FAQSuggestion[] = [
  {
    question: "How do I pay for chapters?",
    href: "/faq?q=payment",
    keywords: ['pay', 'payment', 'bank', 'transfer', 'card', 'money', 'cost', 'price', 'how to pay'],
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    question: "How much does it cost to unlock chapters?",
    href: "/faq?q=price",
    keywords: ['price', 'cost', 'how much', 'rands', 'expensive', 'cheap'],
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    question: "How do I buy PDF books?",
    href: "/faq?q=pdf",
    keywords: ['pdf', 'download book', 'buy pdf', 'purchase pdf'],
    icon: <Download className="w-5 h-5" />
  },
  {
    question: "Why are chapters locked?",
    href: "/faq?q=locked",
    keywords: ['locked', 'unlock', 'why locked', 'cant read', 'not opening'],
    icon: <Lock className="w-5 h-5" />
  },
  {
    question: "How do I create an account?",
    href: "/faq?q=register",
    keywords: ['register', 'sign up', 'create account', 'new account', 'join'],
    icon: <User className="w-5 h-5" />
  },
  {
    question: "I forgot my password",
    href: "/faq?q=password",
    keywords: ['forgot password', 'reset password', 'cant login', 'password help'],
    icon: <User className="w-5 h-5" />
  },
  {
    question: "How do I contact support?",
    href: "/faq?q=contact",
    keywords: ['contact', 'help', 'support', 'whatsapp', 'email', 'reach you'],
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    question: "What does Completed and In Progress mean?",
    href: "/faq?q=completed",
    keywords: ['completed', 'in progress', 'finished', 'status', 'book status'],
    icon: <FileText className="w-5 h-5" />
  }
]

// Natural language intent patterns for sentence understanding
const intentPatterns: IntentPattern[] = [
  {
    patterns: [
      'who is the owner',
      'who owns this site',
      'who owns the website',
      'who created this',
      'who made this site',
      'who is the author',
      'who wrote these books',
      'about the author',
      'who is zandile',
      'tell me about the author'
    ],
    response: {
      title: 'About the Author',
      description: 'Learn about Zandile M, the writer behind all the stories on this platform. Discover their journey, inspiration, and background.',
      href: '/#about',
      icon: <User className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'what is this site',
      'what is this website',
      'what is zandile.m',
      'what does this site do',
      'how does this work',
      'what can i do here',
      'tell me about this site'
    ],
    response: {
      title: 'About Zandile.M Stories',
      description: 'An online platform where you can read books and stories. Browse free chapters, unlock premium content, and purchase complete PDF books.',
      href: '/faq?q=what',
      icon: <HelpCircle className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'how do i read',
      'how to read books',
      'where can i read',
      'how to start reading',
      'can i read for free',
      'where are the books'
    ],
    response: {
      title: 'How to Start Reading',
      description: 'Click on any book in the My Books section. The Prologue is always free to read. Create an account to unlock premium chapters.',
      href: '/faq?q=reading',
      icon: <Book className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'is this free',
      'do i have to pay',
      'is there free content',
      'can i read without paying',
      'what is free',
      'do i need money'
    ],
    response: {
      title: 'Free vs Paid Content',
      description: 'Browsing and reading the Prologue (first chapter) is completely free. Some chapters require payment to unlock.',
      href: '/faq?q=free',
      icon: <Lock className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'how do i buy',
      'how to purchase',
      'how to get pdf',
      'how to download',
      'how do i get the book',
      'how to unlock'
    ],
    response: {
      title: 'How to Purchase Content',
      description: 'Use Card Payment or Bank Transfer to unlock chapters. Completed books offer full PDF purchases.',
      href: '/faq?q=payment',
      icon: <CreditCard className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'i have a problem',
      'something is wrong',
      'i need help',
      'it is not working',
      'error',
      'issue',
      'bug',
      'fix'
    ],
    response: {
      title: 'Need Help? Contact Support',
      description: 'Having technical issues? Reach out via WhatsApp (078 712 7881) or email. We typically respond within 24 hours.',
      href: '/contact',
      icon: <MessageCircle className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'how do i login',
      'where is login',
      'sign in',
      'access my account',
      'where do i sign in'
    ],
    response: {
      title: 'Sign In to Your Account',
      description: 'Access your account to view unlocked chapters, track reading progress, and manage your library.',
      href: '/login',
      icon: <User className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'how do i register',
      'create account',
      'sign up',
      'join',
      'become a member',
      'make an account'
    ],
    response: {
      title: 'Create an Account',
      description: 'Register to unlock chapters, purchase PDFs, and keep track of your reading progress. Quick and easy signup process.',
      href: '/register',
      icon: <User className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'delete account',
      'remove account',
      'can i delete my account',
      'how do i delete my account',
      'close account',
      'deactivate account',
      'erase my account',
      'account deletion'
    ],
    response: {
      title: 'Account Deletion',
      description: 'Learn how to permanently delete your account and all associated data from our platform.',
      href: '/faq?q=delete',
      icon: <User className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'reset password',
      'change password',
      'update password',
      'forgot my password',
      'cant remember password',
      'password reset',
      'new password'
    ],
    response: {
      title: 'Password Help',
      description: 'Reset or change your account password. Follow the steps to regain access to your account.',
      href: '/faq?q=password',
      icon: <Lock className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'update profile',
      'edit profile',
      'change name',
      'update account',
      'profile settings',
      'account settings',
      'change email'
    ],
    response: {
      title: 'Account Settings',
      description: 'Update your profile information, email address, and manage your account preferences.',
      href: '/account',
      icon: <Settings className="w-5 h-5" />
    }
  },
  {
    patterns: [
      'refund',
      'get my money back',
      'money back',
      'return payment',
      'cancel payment',
      'refund policy'
    ],
    response: {
      title: 'Refund Policy',
      description: 'Learn about our refund policy for digital content purchases and how to request a refund.',
      href: '/faq?q=refund',
      icon: <CreditCard className="w-5 h-5" />
    }
  }
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [books, setBooks] = useState<BookResult[]>([])
  const [chapters, setChapters] = useState<ChapterResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      fetchData()
    } else {
      document.body.style.overflow = 'unset'
      setSearchTerm('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch books
      const booksResponse = await fetch('/api/books')
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        setBooks(booksData.books || [])
        
        // Extract chapters from all books
        const allChapters: ChapterResult[] = []
        for (const book of booksData.books || []) {
          try {
            const bookDetailResponse = await fetch(`/api/books/${book.id}`)
            if (bookDetailResponse.ok) {
              const bookDetail = await bookDetailResponse.json()
              if (bookDetail.book?.chapters) {
                bookDetail.book.chapters.forEach((chapter: any) => {
                  allChapters.push({
                    id: chapter.id,
                    title: chapter.title,
                    bookId: book.id,
                    bookTitle: book.title,
                    content: chapter.content?.substring(0, 200) || ''
                  })
                })
              }
            }
          } catch (err) {
            console.error(`Failed to fetch chapters for book ${book.id}:`, err)
          }
        }
        setChapters(allChapters)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchLower = searchTerm.toLowerCase()

  // Filter books
  const filteredBooks = books.filter(book => {
    if (!searchTerm) return false
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.description.toLowerCase().includes(searchLower) ||
      (book.genre && book.genre.toLowerCase().includes(searchLower)) ||
      (book.status && book.status.toLowerCase().includes(searchLower))
    )
  })

  // Filter chapters
  const filteredChapters = chapters.filter(chapter => {
    if (!searchTerm) return false
    return (
      chapter.title.toLowerCase().includes(searchLower) ||
      chapter.bookTitle.toLowerCase().includes(searchLower) ||
      chapter.content.toLowerCase().includes(searchLower)
    )
  })

  // Filter pages
  const filteredPages = staticPages.filter(page => {
    if (!searchTerm) return false
    return (
      page.title.toLowerCase().includes(searchLower) ||
      page.description.toLowerCase().includes(searchLower) ||
      page.category.toLowerCase().includes(searchLower)
    )
  })

  // Filter FAQ suggestions - smart matching based on keywords
  const filteredFAQs = faqSuggestions.filter(faq => {
    if (!searchTerm) return false
    return faq.keywords.some(keyword => searchLower.includes(keyword.toLowerCase()))
  })

  // Advanced AI intent matching with sentence understanding
  const matchedIntents = searchTerm ? intentPatterns.filter(intent => {
    return intent.patterns.some(pattern => {
      const patternLower = pattern.toLowerCase()
      const patternWords = patternLower.split(' ').filter(w => w.length > 2) // Ignore short words
      const queryWords = searchLower.split(' ').filter(w => w.length > 2)
      
      // Exact or substring match
      if (searchLower.includes(patternLower) || patternLower.includes(searchLower)) return true
      
      // Check for key concept matching (important words)
      const keyConcepts = ['delete', 'account', 'password', 'login', 'register', 'pay', 'pdf', 'refund', 'contact', 'help', 'book', 'chapter', 'free', 'buy', 'owner', 'author']
      const hasKeyConcept = keyConcepts.some(concept => 
        searchLower.includes(concept) && patternLower.includes(concept)
      )
      
      // Word matching with different strategies
      const exactMatches = patternWords.filter(word => queryWords.includes(word)).length
      const partialMatches = patternWords.filter(word => 
        queryWords.some(qw => qw.includes(word) || word.includes(qw))
      ).length
      
      // Calculate match score
      const totalMatches = Math.max(exactMatches, partialMatches)
      const matchRatio = patternWords.length > 0 ? totalMatches / patternWords.length : 0
      
      // Accept if:
      // 1. At least 2 exact words match, OR
      // 2. 50%+ words match AND has a key concept, OR  
      // 3. 70%+ words match regardless
      return (
        exactMatches >= 2 ||
        (matchRatio >= 0.5 && hasKeyConcept) ||
        matchRatio >= 0.7
      )
    })
  }) : []

  const hasResults = filteredBooks.length > 0 || filteredChapters.length > 0 || filteredPages.length > 0 || filteredFAQs.length > 0 || matchedIntents.length > 0
  const totalResults = filteredBooks.length + filteredChapters.length + filteredPages.length + filteredFAQs.length + matchedIntents.length

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books, chapters, pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">Searching...</p>
                  </div>
                ) : !searchTerm ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Start typing to search for books, chapters, or pages...</p>
                  </div>
                ) : !hasResults ? (
                  <div className="p-8 text-center">
                    <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No results found for "{searchTerm}"</p>
                    <p className="text-sm text-gray-400 mt-2 mb-6">Try these popular searches instead:</p>
                    
                    {/* Smart Suggestions when no results */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        { label: 'How to pay', href: '/faq?q=payment' },
                        { label: 'Delete account', href: '/faq?q=delete' },
                        { label: 'Contact support', href: '/contact' },
                        { label: 'Reset password', href: '/faq?q=password' },
                        { label: 'Free chapters', href: '/faq?q=free' },
                        { label: 'Buy PDF', href: '/faq?q=pdf' },
                      ].map((suggestion, idx) => (
                        <a
                          key={idx}
                          href={suggestion.href}
                          onClick={onClose}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100 transition-colors"
                        >
                          {suggestion.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {/* Natural Language Intent Results - Show First */}
                    {matchedIntents.length > 0 && (
                      <div className="p-3 bg-blue-50 border-b border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          I think you're looking for...
                        </p>
                      </div>
                    )}
                    {matchedIntents.map((intent, index) => (
                      <Link
                        key={`intent-${index}`}
                        href={intent.response.href}
                        onClick={onClose}
                        className="block hover:bg-blue-50 transition-colors"
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {intent.response.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {intent.response.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {intent.response.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* Smart FAQ Suggestions */}
                    {filteredFAQs.length > 0 && (
                      <div className="p-3 bg-red-50 border-b border-red-100">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          Quick Answers
                        </p>
                      </div>
                    )}
                    {filteredFAQs.map((faq, index) => (
                      <Link
                        key={`faq-${index}`}
                        href={faq.href}
                        onClick={onClose}
                        className="block hover:bg-red-50 transition-colors"
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            {faq.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {faq.question}
                            </h3>
                            <p className="text-sm text-red-600">
                              Click to see answer →
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* Pages Section */}
                    {filteredPages.length > 0 && (
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages & Navigation</p>
                      </div>
                    )}
                    {filteredPages.map((page, index) => (
                      <Link
                        key={`page-${index}`}
                        href={page.href}
                        onClick={onClose}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            {page.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {page.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {page.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{page.category}</span>
                        </div>
                      </Link>
                    ))}

                    {/* Books Section */}
                    {filteredBooks.length > 0 && (
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Books</p>
                      </div>
                    )}
                    {filteredBooks.map((book) => (
                      <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        onClick={onClose}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-4 flex gap-4">
                          <div className="flex-shrink-0 w-16 h-24 bg-gray-200 rounded overflow-hidden">
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                width={64}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Book className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {book.description}
                            </p>
                            <div className="flex gap-2 text-xs">
                              {book.genre && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                  {book.genre}
                                </span>
                              )}
                              {book.status && (
                                <span className={`px-2 py-1 rounded ${book.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {book.status === 'completed' ? 'Completed' : 'In Progress'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* Chapters Section */}
                    {filteredChapters.length > 0 && (
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chapters</p>
                      </div>
                    )}
                    {filteredChapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/book/${chapter.bookId}`}
                        onClick={onClose}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              from <span className="text-red-600">{chapter.bookTitle}</span>
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                              {chapter.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {searchTerm && hasResults && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                  {matchedIntents.length > 0 && ` • ${matchedIntents.length} suggestion${matchedIntents.length !== 1 ? 's' : ''}`}
                  {filteredFAQs.length > 0 && ` • ${filteredFAQs.length} quick answer${filteredFAQs.length !== 1 ? 's' : ''}`}
                  {filteredBooks.length > 0 && ` • ${filteredBooks.length} book${filteredBooks.length !== 1 ? 's' : ''}`}
                  {filteredChapters.length > 0 && ` • ${filteredChapters.length} chapter${filteredChapters.length !== 1 ? 's' : ''}`}
                  {filteredPages.length > 0 && ` • ${filteredPages.length} page${filteredPages.length !== 1 ? 's' : ''}`}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
