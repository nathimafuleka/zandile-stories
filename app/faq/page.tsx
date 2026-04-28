'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BookOpen, CreditCard, Download, Lock, Unlock, HelpCircle, MessageCircle, FileText, User, Settings } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface FAQItem {
  question: string
  answer: string | React.ReactNode
  icon: React.ReactNode
  category: string
}

const faqData: FAQItem[] = [
  // General Questions
  {
    question: "What is Zandile.M Stories?",
    answer: "Zandile.M Stories is an online platform where you can read books and stories written by Zandile M. The platform offers both free chapters and premium locked chapters that can be unlocked through payment. You can also purchase complete PDF versions of books.",
    icon: <BookOpen className="w-5 h-5" />,
    category: "General"
  },
  {
    question: "Do I need an account to read books?",
    answer: "No, you can browse and read free chapters without an account. However, you need to register and log in to unlock paid chapters, purchase PDF books, and track your reading progress.",
    icon: <User className="w-5 h-5" />,
    category: "General"
  },
  {
    question: "Is the platform free to use?",
    answer: "Browsing and reading free chapters is completely free. Some chapters require payment to unlock, and PDF books can be purchased separately. Each book shows its status (Completed or In Progress) so you know what to expect.",
    icon: <HelpCircle className="w-5 h-5" />,
    category: "General"
  },

  // Reading & Chapters
  {
    question: "How do I start reading a book?",
    answer: "Simply click on any book in the 'My Books' section on the homepage. You'll be taken to the book reader where you can select chapters from the table of contents on the left side.",
    icon: <BookOpen className="w-5 h-5" />,
    category: "Reading"
  },
  {
    question: "What does 'In Progress' and 'Completed' mean?",
    answer: (
      <div className="space-y-2">
        <p><strong className="text-green-600">Completed:</strong> The book is finished with all chapters published. You can purchase the full PDF version.</p>
        <p><strong className="text-yellow-600">In Progress:</strong> The book is still being written. New chapters are added regularly, and you can unlock chapters as they become available.</p>
      </div>
    ),
    icon: <FileText className="w-5 h-5" />,
    category: "Reading"
  },
  {
    question: "Why are some chapters locked?",
    answer: "Chapters are locked to support the author's work. Unlocking chapters requires a small payment. The Prologue (first chapter) is always free to read. Once you unlock a chapter, it's permanently available in your account.",
    icon: <Lock className="w-5 h-5" />,
    category: "Reading"
  },
  {
    question: "Do I keep access to unlocked chapters forever?",
    answer: "Yes! Once you unlock a chapter, it remains unlocked in your account permanently. You can re-read it anytime by logging into your account.",
    icon: <Unlock className="w-5 h-5" />,
    category: "Reading"
  },

  // Payments & Pricing
  {
    question: "How much does it cost to unlock a chapter?",
    answer: "Chapter unlock prices are set by the admin and may vary. The current pricing is displayed when you attempt to unlock a chapter. We offer two payment methods: Card Payment (slightly higher price) and Bank Transfer (discounted price).",
    icon: <CreditCard className="w-5 h-5" />,
    category: "Payments"
  },
  {
    question: "How do I pay for chapter unlocks?",
    answer: (
      <div className="space-y-2">
        <p>We offer two payment methods:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>Card Payment:</strong> Pay online with your credit/debit card (Yoco payment gateway)</li>
          <li><strong>Bank Transfer:</strong> Make a direct bank transfer and submit your proof of payment</li>
        </ul>
        <p>Bank transfer payments are verified by admin before unlocking content.</p>
      </div>
    ),
    icon: <CreditCard className="w-5 h-5" />,
    category: "Payments"
  },
  {
    question: "How long does it take to unlock after payment?",
    answer: "Card payments unlock chapters instantly. Bank transfer payments require admin verification, which typically takes a few hours to 24 hours depending on when the payment is submitted.",
    icon: <Settings className="w-5 h-5" />,
    category: "Payments"
  },
  {
    question: "What are the banking details for transfers?",
    answer: "Bank transfer details are displayed in the payment modal when you select 'Bank Transfer' as your payment method. You'll also receive them via email after submitting a payment request.",
    icon: <FileText className="w-5 h-5" />,
    category: "Payments"
  },

  // PDF Purchases
  {
    question: "Can I buy the complete book as a PDF?",
    answer: "Yes! Completed books can be purchased as downloadable PDF files. Look for the 'Buy PDF' button in the book reader (only available for Completed books).",
    icon: <Download className="w-5 h-5" />,
    category: "PDF Purchases"
  },
  {
    question: "How much does a PDF book cost?",
    answer: "PDF book prices are set by the admin and are typically around R60. The exact price is displayed on the 'Buy PDF' button.",
    icon: <CreditCard className="w-5 h-5" />,
    category: "PDF Purchases"
  },
  {
    question: "Can I download the PDF multiple times?",
    answer: "Yes, once you purchase a PDF, you can download it unlimited times from your account. The download link remains available in the book reader.",
    icon: <Download className="w-5 h-5" />,
    category: "PDF Purchases"
  },
  {
    question: "Why can't I buy PDFs for 'In Progress' books?",
    answer: "PDFs are only available for Completed books to ensure you receive the full, finished story. In Progress books are still being written, so the PDF would be incomplete.",
    icon: <HelpCircle className="w-5 h-5" />,
    category: "PDF Purchases"
  },

  // Account Management
  {
    question: "How do I create an account?",
    answer: "Click the 'Login' button in the header, then select 'Register'. Fill in your name, email, and password. You'll need to verify your email before you can make purchases.",
    icon: <User className="w-5 h-5" />,
    category: "Account"
  },
  {
    question: "I forgot my password. What should I do?",
    answer: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you a link to reset your password. The link is valid for 1 hour.",
    icon: <Settings className="w-5 h-5" />,
    category: "Account"
  },
  {
    question: "How can I delete my account?",
    answer: "Go to your Profile page (click your name in the header), scroll to the bottom, and click 'Delete Account'. This will permanently remove your account and all associated data.",
    icon: <User className="w-5 h-5" />,
    category: "Account"
  },
  {
    question: "Where can I see my unlocked chapters and purchases?",
    answer: "Log in and click on your name in the header, then select 'Profile'. Your dashboard shows all your unlocked chapters, PDF purchases, and payment history.",
    icon: <FileText className="w-5 h-5" />,
    category: "Account"
  },

  // Coming Soon
  {
    question: "What is 'Coming Soon'?",
    answer: "Coming Soon shows books that will be published in the future. Each book displays its release date. Once the release date passes, the book automatically moves to 'My Books' and its status becomes 'In Progress' or 'Completed'.",
    icon: <BookOpen className="w-5 h-5" />,
    category: "Coming Soon"
  },
  {
    question: "Can I pre-order Coming Soon books?",
    answer: "Currently, pre-orders are not available. You'll be able to access the book and unlock chapters once it's released and moved to 'My Books'.",
    icon: <HelpCircle className="w-5 h-5" />,
    category: "Coming Soon"
  },

  // Support
  {
    question: "How can I contact support?",
    answer: (
      <div className="space-y-2">
        <p>You can reach us through:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>WhatsApp: Click the WhatsApp icon in the header</li>
          <li>Contact section on the homepage</li>
          <li>Email us directly if you have payment issues</li>
        </ul>
      </div>
    ),
    icon: <MessageCircle className="w-5 h-5" />,
    category: "Support"
  },
  {
    question: "What if my payment doesn't unlock the content?",
    answer: "If your bank transfer payment hasn't been verified within 24 hours, or if you experience any issues with card payments, please contact support immediately with your payment reference number.",
    icon: <HelpCircle className="w-5 h-5" />,
    category: "Support"
  },
  {
    question: "Are refunds available?",
    answer: "Due to the digital nature of our content, refunds are generally not provided once chapters are unlocked or PDFs are downloaded. However, if you experience technical issues, please contact support and we'll review your case.",
    icon: <Settings className="w-5 h-5" />,
    category: "Support"
  },
  {
    question: "How do I delete my account?",
    answer: (
      <div className="space-y-2">
        <p>To permanently delete your account and all associated data:</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Log in to your account</li>
          <li>Go to Account Settings (click your profile icon)</li>
          <li>Scroll to the bottom and click "Delete Account"</li>
          <li>Confirm your decision</li>
        </ol>
        <p className="text-red-600 font-medium mt-2">Warning: This action cannot be undone. All your unlocked chapters, purchase history, and personal data will be permanently removed.</p>
        <p className="mt-2">If you need assistance, contact support before deleting your account.</p>
      </div>
    ),
    icon: <User className="w-5 h-5" />,
    category: "Account"
  }
]

const categories = Array.from(new Set(faqData.map(item => item.category)))

// Keywords for smart matching
const keywordMap: { [key: string]: number[] } = {
  // Payment related
  'payment': [7, 8, 9, 10, 11, 22],
  'pay': [7, 8, 9, 10, 11, 22],
  'money': [7, 8, 9, 10, 11],
  'bank': [8, 9, 10],
  'transfer': [8, 9, 10],
  'card': [8],
  'price': [7, 11],
  'cost': [7, 11],
  'rands': [7, 11],
  'unlock': [5, 7, 8],
  
  // PDF related
  'pdf': [11, 12, 13, 14],
  'download': [11, 12, 13],
  'buy pdf': [11, 12, 13],
  'purchase pdf': [11, 12, 13],
  
  // Account related
  'account': [1, 15, 16, 17, 18, 24],
  'login': [1, 15, 16],
  'register': [1, 15],
  'sign in': [1, 15],
  'sign up': [1, 15],
  'password': [16],
  'forgot': [16],
  'delete': [17, 24],
  'remove': [24],
  'deactivate': [24],
  'profile': [18],
  
  // Reading related
  'read': [3, 4, 5, 6],
  'chapter': [3, 4, 5, 6, 7],
  'book': [0, 1, 2, 3, 4, 5, 6],
  'locked': [5],
  'progress': [4, 14],
  'completed': [4],
  'in progress': [4],
  
  // Support
  'contact': [21, 22],
  'help': [0, 21, 22, 23],
  'support': [21, 22, 23],
  'refund': [23],
  'problem': [21, 22],
  'issue': [21, 22],
  
  // General
  'what is': [0],
  'how to': [3, 8, 15],
  'free': [2, 5],
  'coming soon': [19, 20],
}

function FAQContent() {
  const searchParams = useSearchParams()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const faqRefs = useRef<(HTMLDivElement | null)[]>([])

  const filteredFAQs = activeCategory === "All" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory)

  // Handle URL parameters for auto-opening FAQs
  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('search')
    const faqId = searchParams.get('faq')
    
    if (faqId) {
      // Direct FAQ ID provided
      const index = parseInt(faqId)
      if (!isNaN(index) && index >= 0 && index < faqData.length) {
        setOpenIndex(index)
        setTimeout(() => {
          faqRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    } else if (query) {
      // Smart matching based on query
      const queryLower = query.toLowerCase()
      let bestMatch: number | null = null
      let bestScore = 0
      
      // Check keyword map
      for (const [keyword, indices] of Object.entries(keywordMap)) {
        if (queryLower.includes(keyword)) {
          // Score based on keyword specificity (shorter = more specific)
          const score = 100 / keyword.length
          if (score > bestScore) {
            bestScore = score
            bestMatch = indices[0] // Take first matching FAQ
          }
        }
      }
      
      // If no keyword match, search in questions and answers
      if (bestMatch === null) {
        faqData.forEach((faq, index) => {
          const questionLower = faq.question.toLowerCase()
          const categoryLower = faq.category.toLowerCase()
          
          if (questionLower.includes(queryLower) || categoryLower.includes(queryLower)) {
            const score = questionLower.includes(queryLower) ? 50 : 25
            if (score > bestScore) {
              bestScore = score
              bestMatch = index
            }
          }
        })
      }
      
      if (bestMatch !== null) {
        setOpenIndex(bestMatch)
        setActiveCategory("All")
        setTimeout(() => {
          faqRefs.current[bestMatch!]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }
  }, [searchParams])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16" style={{ backgroundColor: '#FCF8F7' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about reading, unlocking chapters, payments, and more.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "All"
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                ref={(el) => { faqRefs.current[index] = el }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 text-red-600">
                    {faq.icon}
                  </div>
                  <span 
                    className="flex-1 text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-16">
                        <div className="text-gray-700 leading-relaxed">
                          {typeof faq.answer === 'string' ? (
                            <p>{faq.answer}</p>
                          ) : (
                            faq.answer
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="bg-red-50 rounded-lg p-8">
              <MessageCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
              >
                Still have questions?
              </h2>
              <p className="text-gray-600 mb-6">
                We're here to help! Reach out to us via WhatsApp or email.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FCF8F7' }}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>}>
      <FAQContent />
    </Suspense>
  )
}
