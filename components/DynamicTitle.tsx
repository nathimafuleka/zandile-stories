'use client'

import { useEffect } from 'react'

export default function DynamicTitle() {
  useEffect(() => {
    const updateTitle = () => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings && data.settings.siteName) {
            document.title = `${data.settings.siteName} | Romance Novelist`
          }
        })
        .catch(err => console.error('Failed to fetch settings for title:', err))
    }

    // Update immediately
    updateTitle()

    // Poll every 30 seconds
    const interval = setInterval(updateTitle, 30000)

    return () => clearInterval(interval)
  }, [])

  return null
}
