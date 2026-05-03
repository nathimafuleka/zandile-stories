'use client'

import { motion } from 'framer-motion'
import { BookOpen, Heart, Users, Star, Facebook, MessageCircle, Mail } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const stats = [
  { icon: <BookOpen className="w-6 h-6" />, value: '10+', label: 'Stories Written' },
  { icon: <Users className="w-6 h-6" />, value: '500+', label: 'Happy Readers' },
  { icon: <Heart className="w-6 h-6" />, value: '100%', label: 'Passion Driven' },
  { icon: <Star className="w-6 h-6" />, value: '5★', label: 'Reader Rating' },
]

const values = [
  {
    title: 'Authentic Storytelling',
    description: 'Every story is written from the heart, reflecting real emotions, African culture, and lived experiences that resonate deeply with readers.',
    color: 'bg-red-100 text-red-600',
  },
  {
    title: 'Accessible Reading',
    description: 'Stories should be for everyone. We offer affordable chapter unlocks and PDF downloads so no reader is left behind.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    title: 'Community First',
    description: 'Our readers are our family. We listen, engage, and grow together through every page, comment, and shared story.',
    color: 'bg-orange-100 text-orange-600',
  },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16" style={{ backgroundColor: '#FCF8F7' }}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-3xl mx-auto"
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

          {/* Author Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto mb-16"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-5xl font-bold">
                  Z
                </div>
              </div>
              <div>
                <h2
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                >
                  Zandile Mafuleka
                </h2>
                <p className="text-red-600 font-medium mb-4">Author & Storyteller</p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Hi, I'm Zandile — a passionate storyteller from South Africa with a love for 
                  weaving compelling narratives that touch the soul. My stories explore love, 
                  identity, resilience, and the beautiful complexity of African life.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  I started writing to give a voice to stories that are rarely told — stories 
                  that reflect who we truly are. Every chapter I write is a piece of my heart, 
                  and I'm grateful for every reader who joins me on this journey.
                </p>
                <div className="flex gap-3 mt-6">
                  <a
                    href="https://web.facebook.com/profile.php?id=61584588283081"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                  <a
                    href="https://wa.me/27787127881"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:support@zandilemstories.com"
                    className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-3">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2
              className="text-3xl font-bold text-gray-900 text-center mb-10"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              What We Stand For
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className={`w-10 h-10 rounded-lg ${value.color} flex items-center justify-center mb-4`}>
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center bg-red-600 rounded-2xl p-10 max-w-3xl mx-auto text-white"
          >
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              Ready to Start Reading?
            </h2>
            <p className="text-red-100 mb-6 text-lg">
              Explore our collection of heartfelt stories and find your next favourite read.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="bg-white text-red-600 font-semibold px-8 py-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                Browse Stories
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  )
}
