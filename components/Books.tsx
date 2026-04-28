'use client'

import { motion } from 'framer-motion'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Book {
  id: string
  title: string
  description: string
  coverImage: string | null
  year: string | null
  genre: string | null
  status: string
  _count?: {
    chapters: number
  }
}

interface ComingSoonBook {
  id: string
  title: string
  description: string
  coverImage: string | null
  year: string | null
  genre: string | null
  releaseDate: string | null
}

// Coming soon info component with countdown
function ComingSoonInfo({ releaseDate }: { releaseDate: string | null }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    if (!releaseDate) return

    const targetDate = new Date(releaseDate).getTime()
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [releaseDate])

  const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : ''

  if (!timeLeft) return null

  return (
    <div className="mb-4 text-center">
      <div className="text-red-600 font-bold mb-2">{formattedDate}</div>
      <div className="text-gray-600 text-xs font-bold mb-2">RELEASES IN</div>
      <div className="flex gap-2 justify-center">
        <div className="bg-red-600 text-white px-3 py-2 rounded min-w-[50px]">
          <div className="text-lg font-bold">{timeLeft.days}</div>
          <div className="text-[10px]">Days</div>
        </div>
        <div className="bg-red-600 text-white px-3 py-2 rounded min-w-[50px]">
          <div className="text-lg font-bold">{timeLeft.hours}</div>
          <div className="text-[10px]">Hours</div>
        </div>
        <div className="bg-red-600 text-white px-3 py-2 rounded min-w-[50px]">
          <div className="text-lg font-bold">{timeLeft.minutes}</div>
          <div className="text-[10px]">Mins</div>
        </div>
        <div className="bg-red-600 text-white px-3 py-2 rounded min-w-[50px]">
          <div className="text-lg font-bold">{timeLeft.seconds}</div>
          <div className="text-[10px]">Secs</div>
        </div>
      </div>
    </div>
  )
}

export default function Books() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [publishedBooks, setPublishedBooks] = useState<Book[]>([])
  const [comingSoonBooks, setComingSoonBooks] = useState<ComingSoonBook[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchBooks()
    
    // Detect mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchBooks = async () => {
    try {
      const [publishedResponse, comingSoonResponse] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/books/coming-soon')
      ])

      if (publishedResponse.ok) {
        const data = await publishedResponse.json()
        setPublishedBooks(data.books)
      }

      if (comingSoonResponse.ok) {
        const data = await comingSoonResponse.json()
        setComingSoonBooks(data.books || [])
      }
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = useMemo(() => {
    return publishedBooks.filter(book => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        book.title.toLowerCase().includes(search) ||
        book.description.toLowerCase().includes(search) ||
        (book.genre && book.genre.toLowerCase().includes(search))
      )
    })
  }, [publishedBooks, searchTerm])

  const slideNext = () => {
    // Show 4 books when Coming Soon is hidden, 3 when visible
    const visibleBooks = comingSoonBooks.length === 0 ? 4 : 3
    // Only allow sliding if there are more books beyond the visible ones
    if (currentIndex < filteredBooks.length - visibleBooks) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const slidePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  useEffect(() => {
    // Show 4 books when Coming Soon is hidden, 3 when visible
    const visibleBooks = comingSoonBooks.length === 0 ? 4 : 3
    setShowLeftArrow(currentIndex > 0)
    setShowRightArrow(currentIndex < filteredBooks.length - visibleBooks)
  }, [currentIndex, filteredBooks.length, comingSoonBooks.length])

  return (
    <section 
      id="work" 
      className="py-12 md:py-16 px-4 sm:px-6" 
      ref={ref}
      style={{ backgroundColor: '#FCF8F7' }}
    >
      <div className="container mx-auto">
        <div className="mb-8 inline-block">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
          >
            My Work
          </motion.h2>
          <div 
            style={{
              backgroundImage: 'url(/assets/images/divider.jpg)',
              backgroundRepeat: 'repeat-x',
              height: '3px',
              width: '50%'
            }}
          ></div>
        </div>

        <div className={`grid gap-12 lg:gap-40 items-start ${comingSoonBooks.length > 0 ? 'grid-cols-1 lg:grid-cols-[300px_1fr]' : 'grid-cols-1'}`}>
          {comingSoonBooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center lg:items-start"
            >
              <h3 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center lg:text-left"
                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
              >
                Coming Soon
              </h3>
              
              {comingSoonBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-xs">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={book.coverImage || '/assets/images/default-book-cover.jpg'}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                    <div 
                      className="absolute top-4 left-0 text-white px-8 py-3 font-bold text-sm"
                      style={{
                        backgroundImage: 'url(/assets/images/brush-stroke-red.png)',
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        minWidth: '250px',
                        minHeight: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {book.releaseDate 
                        ? new Date(book.releaseDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Coming Soon'
                      }
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 
                      className="text-2xl font-bold text-gray-900 mb-3"
                      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                    >
                      {book.title}
                    </h4>
                    <p 
                      className="text-gray-700 leading-relaxed"
                      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                    >
                      {book.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
          >
            <h3 
              className={`text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 ${comingSoonBooks.length > 0 ? 'text-center lg:text-left' : 'text-center'}`}
              style={{ 
                fontFamily: "'Source Sans Pro', sans-serif"
              }}
            >
              <span className={comingSoonBooks.length > 0 ? 'lg:ml-[280px]' : ''}>
                My Books
              </span>
            </h3>
            
            <div className="relative">
              <div className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide md:overflow-hidden">
                <div 
                  className="flex gap-6 md:transition-transform md:duration-500 md:ease-in-out"
                  style={{ transform: isMobile ? 'none' : `translateX(-${currentIndex * (256 + 24)}px)` }}
                >
                  {loading ? (
                    <div className="flex gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden flex-shrink-0 w-64 animate-pulse">
                          <div className="w-full aspect-[2/3] bg-gray-300"></div>
                          <div className="p-6">
                            <div className="h-6 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded mb-3 w-2/3"></div>
                            <div className="h-4 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : publishedBooks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No published books yet</p>
                    </div>
                  ) : (
                    filteredBooks.map((book, index) => (
                      <Link key={book.id} href={`/book/${book.id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer flex-shrink-0 w-64"
                        >
                          <div className="relative w-full aspect-[2/3] bg-gray-200">
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                                No Cover
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h4 
                              className="text-xl font-bold text-gray-900 mb-3"
                              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                            >
                              {book.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${book.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {book.status === 'completed' ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <p 
                              className="text-sm text-gray-600 mb-3"
                              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                            >
                              {book.year && `Published: ${book.year}`}
                              {book.year && book._count && book._count.chapters > 0 && ' | '}
                              {book._count && book._count.chapters > 0 && `${book._count.chapters} chapter${book._count.chapters !== 1 ? 's' : ''}`}
                            </p>
                            <p 
                              className="text-gray-700 leading-relaxed text-sm line-clamp-3"
                              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                            >
                              {book.description}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {showLeftArrow && (
                <button
                  onClick={slidePrev}
                  className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 z-50 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-xl hover:bg-white transition-all hover:scale-110"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
              )}
              
              {showRightArrow && (
                <button
                  onClick={slideNext}
                  className="hidden md:block absolute left-[792px] top-1/2 -translate-y-1/2 z-50 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-xl hover:bg-white transition-all hover:scale-110"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
