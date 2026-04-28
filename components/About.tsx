'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Award, BookOpen, Users, Pen } from 'lucide-react'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { icon: BookOpen, label: 'Books Published', value: '12+' },
    { icon: Award, label: 'Awards Won', value: '8' },
    { icon: Users, label: 'Readers Worldwide', value: '500K+' },
    { icon: Pen, label: 'Years Writing', value: '15+' },
  ]

  return (
    <section id="about" className="py-20 px-6" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-effect rounded-2xl p-8 md:p-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">My Journey</h3>
            <p className="text-gray-600 leading-relaxed mb-4 font-serif">
              For over a decade, I've been weaving narratives that explore the depths of human emotion, 
              the complexities of relationships, and the beauty of our shared experiences. My writing 
              journey began with a simple love for storytelling and has evolved into a passionate career.
            </p>
            <p className="text-gray-600 leading-relaxed font-serif">
              Each book I write is a labor of love, carefully crafted to resonate with readers and 
              leave a lasting impact. I believe in the power of words to transform lives, spark 
              conversations, and build bridges between diverse perspectives.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-effect rounded-2xl p-8 md:p-12 bg-gradient-to-br from-purple-50 to-pink-50"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Writing Philosophy</h3>
            <p className="text-gray-600 leading-relaxed mb-4 font-serif">
              "Every story is a journey, and every character a reflection of our shared humanity. 
              I write to connect, to inspire, and to remind us all of the extraordinary within the ordinary."
            </p>
            <p className="text-gray-600 leading-relaxed font-serif italic">
              My work spans multiple genres, from contemporary fiction to thought-provoking literary 
              pieces, always with a focus on authentic characters and compelling narratives.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-effect rounded-xl p-6 text-center"
            >
              <stat.icon className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
