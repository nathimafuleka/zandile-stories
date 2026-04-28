import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import DynamicTitle from '@/components/DynamicTitle'

export const metadata: Metadata = {
  title: 'Zandile.M Stories | Romance Novelist',
  description: 'Explore the captivating romance novels by Zandile.M Stories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ToastProvider>
            <DynamicTitle />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
