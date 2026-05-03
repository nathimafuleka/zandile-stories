'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16" style={{ backgroundColor: '#FCF8F7' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              About <span className="text-red-600">Zandile.M Stories</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              A home for authentic African stories — written with passion, shared with love, 
              and crafted for readers who crave real, heartfelt narratives.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
