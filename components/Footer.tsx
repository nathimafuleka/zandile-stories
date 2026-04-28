'use client'

import { useState, useEffect } from 'react'

export default function Footer() {
  const [siteName, setSiteName] = useState('Zandile.M Stories')

  useEffect(() => {
    // Fetch site name from settings
    const fetchSiteName = () => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings && data.settings.siteName) {
            setSiteName(data.settings.siteName)
          }
        })
        .catch(err => console.error('Failed to fetch settings:', err))
    }

    // Fetch immediately
    fetchSiteName()

    // Poll every 30 seconds to check for updates
    const interval = setInterval(fetchSiteName, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-gray-800 py-4">
      <div className="container mx-auto px-6">
        <p className="text-center text-white text-sm">
          © Copyright {siteName} {new Date().getFullYear()}. All rights reserved.
          <br />
          Developed by Bayzel Media
        </p>
      </div>
    </footer>
  )
}
