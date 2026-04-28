'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Books from '@/components/Books'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Books />
      <Footer />
    </main>
  )
}
