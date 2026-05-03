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
              About <span className="text-red-600">Zandile Mnguni</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Zandile Samantha Mnguni is a South African author of dark romance fiction rooted in culture, intensity, and emotional depth.

              She is the author of <i>Bloodbound</i> and <i>The Royal Mark</i>, two emerging works that introduce readers to her world of layered, emotionally charged storytelling.

              With a background in drama and a deep connection to performance, her writing is shaped by character, movement, and atmosphere. Having worked across acting, dance, choreography, and directing, she brings a visual and emotional precision to her stories, where every interaction feels intentional and alive.

              She has been writing since a young age, turning thoughts and emotions into stories—creating meaning from both the world around her and the one within her. What began as a personal outlet has grown into a craft she now shares with readers ready to feel something deeper.

              As she continues to build her catalogue, her focus remains the same: to create stories that are immersive, culturally grounded, and impossible to forget.

              Discover her work, unlock chapters, and step into a world where love is never simple, and never safe.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
