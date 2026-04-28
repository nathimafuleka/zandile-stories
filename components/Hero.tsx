'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <section 
      id="home" 
      className="relative min-h-[400px] md:min-h-[500px] flex items-center pt-20"
      style={{ backgroundColor: '#FCF8F7' }}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-start text-center pt-4 md:pt-8 order-2 md:order-1"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-3"
              style={{ 
                fontFamily: "'Brush Script MT', cursive",
                fontStyle: 'italic',
                lineHeight: '1.2'
              }}
            >
              Zandile.M
            </motion.h1>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"
              style={{ 
                fontFamily: "'Brush Script MT', cursive",
                fontStyle: 'italic',
                lineHeight: '1.2'
              }}
            >
              Stories
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="border-t-2 border-gray-800 w-24 mt-6 mb-4 mx-auto"
            ></motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-base md:text-lg text-gray-700"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-h-[400px] sm:max-h-[500px] md:max-h-[600px] order-1 md:order-2"
          >
            <Image
              src="/assets/images/zandiii.jpg"
              alt="Zandile M"
              width={600}
              height={700}
              className="w-full h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function HeroDivider() {
  return (
    <div 
      className="divider"
      style={{
        backgroundImage: 'url(/assets/images/divider.jpg)',
        backgroundRepeat: 'repeat-x',
        height: '3px'
      }}
    ></div>
  )
}
