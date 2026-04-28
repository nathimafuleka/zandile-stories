'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Plus, Edit, Trash2, LogOut, FileText, Eye, Wallet, DollarSign, TrendingUp, Calendar, ChevronDown, Users, Settings, Lock, FileUp, Download, X } from 'lucide-react'
import CalendarComponent from '@/components/Calendar'
import { useToast } from '@/contexts/ToastContext'

interface BookType {
  id: string
  title: string
  author: string
  description: string
  coverImage: string | null
  year: string | null
  genre: string | null
  status: string
  createdAt: string
  _count?: {
    chapters: number
  }
}

interface EarningsStats {
  today: { amount: number; count: number }
  week: { amount: number; count: number }
  month: { amount: number; count: number }
  year: { amount: number; count: number }
  total: { amount: number; count: number }
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: {
    name: string
  }
  createdAt: string
}

interface PaymentSubmission {
  id: string
  userId: string
  userName: string
  userEmail: string
  chapterId: string | null
  chapterTitle: string
  chapterOrder: number
  bookTitle: string
  bookId: string
  paymentReference: string
  proofOfPayment: string | null
  purchaseType: string
  price: number
  status: string
  adminNote: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { showToast } = useToast()
  const [books, setBooks] = useState<BookType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [earningsStats, setEarningsStats] = useState<EarningsStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedCustomDate, setSelectedCustomDate] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [userCount, setUserCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'finance' | 'users' | 'books' | 'payments' | 'settings'>('finance')
  const [settings, setSettings] = useState({
    siteName: 'Zandile.M Stories',
    adminEmail: 'admin@zandile.com',
    logoType: 'text',
    logoText: 'Zandile M',
    logoImage: '',
    downloadPriceCard: 65,
    downloadPriceBank: 60,
    unlockChapterPriceCard: 35,
    unlockChapterPriceBank: 30,
    currency: 'ZAR',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branchCode: '',
    accountType: '',
    enableUserRegistration: false,
    enableEmailNotifications: true,
    allowBookPreviews: true,
    requireLoginToRead: false,
    enablePayments: true,
    twoFactorAuth: true,
    autoLogoutInactivity: true
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [paymentToReview, setPaymentToReview] = useState<PaymentSubmission | null>(null)
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [payments, setPayments] = useState<PaymentSubmission[]>([])
  const [paymentFilter, setPaymentFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('')

  useEffect(() => {
    checkAuth()
    fetchBooks()
    fetchEarningsStats()
    fetchUsers()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedPeriod !== 'today') {
      fetchTransactions()
    }
  }, [selectedPeriod])

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments()
    }
  }, [paymentFilter])

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }

    try {
      const response = await fetch('/api/auth/check-admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('adminToken')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin')
    }
  }

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/books', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch books')

      const data = await response.json()
      setBooks(data.books)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setBookToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!bookToDelete) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete book')

      setBooks(books.filter(book => book.id !== bookToDelete))
      showToast('Book deleted successfully', 'success')
      setShowDeleteModal(false)
      setBookToDelete(null)
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error')
      setShowDeleteModal(false)
      setBookToDelete(null)
    }
  }

  const fetchEarningsStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/earnings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEarningsStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch earnings stats:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setUserCount(data.count)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({ period: selectedPeriod })
      
      if (selectedCustomDate) {
        // Set start and end to same date to get earnings for that specific day
        params.set('period', 'custom')
        params.append('startDate', selectedCustomDate)
        const endDate = new Date(selectedCustomDate)
        endDate.setHours(23, 59, 59, 999)
        params.append('endDate', endDate.toISOString().split('T')[0])
      }

      const response = await fetch(`/api/admin/earnings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  }

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched settings from API:', data.settings)
        setSettings({
          siteName: data.settings.siteName || 'Zandile.M Stories',
          adminEmail: data.settings.adminEmail || 'admin@zandile.com',
          logoType: data.settings.logoType || 'text',
          logoText: data.settings.logoText || 'Zandile M',
          logoImage: data.settings.logoImage || '',
          downloadPriceCard: Number(data.settings.downloadPriceCard || 65),
          downloadPriceBank: Number(data.settings.downloadPriceBank || 60),
          unlockChapterPriceCard: Number(data.settings.unlockChapterPriceCard || 35),
          unlockChapterPriceBank: Number(data.settings.unlockChapterPriceBank || 30),
          currency: data.settings.currency || 'ZAR',
          bankName: data.settings.bankName || '',
          accountNumber: data.settings.accountNumber || '',
          accountHolder: data.settings.accountHolder || '',
          branchCode: data.settings.branchCode || '',
          accountType: data.settings.accountType || '',
          enableUserRegistration: data.settings.enableUserRegistration ?? true,
          enableEmailNotifications: data.settings.enableEmailNotifications ?? true,
          allowBookPreviews: data.settings.allowBookPreviews ?? true,
          requireLoginToRead: data.settings.requireLoginToRead ?? false,
          enablePayments: data.settings.enablePayments ?? true,
          twoFactorAuth: data.settings.twoFactorAuth ?? false,
          autoLogoutInactivity: data.settings.autoLogoutInactivity ?? true
        })
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log('Fetching payments with filter:', paymentFilter)
      const response = await fetch(`/api/admin/payments?status=${paymentFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Payments fetched:', data)
        setPayments(data.submissions)
      } else {
        console.error('Failed to fetch payments:', response.status, await response.text())
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
    }
  }

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject', note?: string) => {
    setProcessingPayment(paymentId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, adminNote: note })
      })

      if (response.ok) {
        showToast(action === 'approve' ? 'Payment approved and chapter unlocked!' : 'Payment rejected', 'success')
        fetchPayments() // Refresh list
      } else {
        throw new Error('Failed to process payment')
      }
    } catch (err) {
      showToast('Failed to process payment', 'error')
    } finally {
      setProcessingPayment(null)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        showToast('Settings saved successfully!', 'success')
      } else {
        showToast('Failed to save settings', 'error')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      showToast('Failed to save settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        showToast('Password changed successfully!', 'success')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        setPasswordError(data.message || 'Failed to change password')
      }
    } catch (err) {
      console.error('Failed to change password:', err)
      setPasswordError('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, logoImage: data.logoUrl })
        showToast('Logo uploaded successfully!', 'success')
      } else {
        const data = await response.json()
        showToast(data.message || 'Failed to upload logo', 'error')
      }
    } catch (err) {
      console.error('Failed to upload logo:', err)
      showToast('Failed to upload logo', 'error')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCurrentEarnings = () => {
    if (!earningsStats) return { amount: 0, count: 0 }
    
    // If custom date is selected, calculate earnings from transactions
    if (selectedCustomDate && showDatePicker === false) {
      const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
      return { amount: total, count: transactions.length }
    }
    
    return earningsStats[selectedPeriod]
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCF8F7' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200">
          <nav className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('finance')}
              className={`pb-3 sm:pb-4 px-2 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'finance'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              Finance
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 sm:pb-4 px-2 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'users'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`pb-3 sm:pb-4 px-2 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'books'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Book className="w-4 h-4 sm:w-5 sm:h-5" />
              Books
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-3 sm:pb-4 px-2 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'payments'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              Payments
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 sm:pb-4 px-2 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'settings'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              Settings
            </button>
          </nav>
        </div>

        {/* Finance Tab */}
        {activeTab === 'finance' && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Earnings Wallet</h2>
          </div>

          {/* Period Selector */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => {
                setSelectedPeriod('today')
                setShowDatePicker(false)
                setSelectedCustomDate('')
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                selectedPeriod === 'today' && !showDatePicker && !selectedCustomDate
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                showDatePicker || (selectedCustomDate && !showDatePicker)
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {selectedCustomDate && !showDatePicker ? 'Change Date' : 'Custom Date'}
            </button>
          </div>

          {/* Custom Date Picker */}
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200 max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Select a Specific Date
              </h3>
              
              <CalendarComponent
                selectedDate={selectedCustomDate}
                onSelectDate={(date) => setSelectedCustomDate(date)}
              />
              
              {selectedCustomDate && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    📊 Selected: <strong>{new Date(selectedCustomDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</strong>
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    fetchTransactions()
                    setShowDatePicker(false)
                  }}
                  disabled={!selectedCustomDate}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  View Earnings
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomDate('')
                    setShowDatePicker(false)
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Earnings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10" />
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedCustomDate && !showDatePicker 
                  ? `Earnings - ${new Date(selectedCustomDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Total Earnings'
                }
              </h3>
              <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(getCurrentEarnings().amount)}</p>
              <p className="text-green-100 mt-2 text-sm sm:text-base">{getCurrentEarnings().count} sales</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Book className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Time</h3>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {earningsStats ? formatCurrency(earningsStats.total.amount) : 'R 0,00'}
              </p>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">{earningsStats?.total.count || 0} total sales</p>
            </motion.div>
          </div>

        </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Registered Users</h2>
            </div>

            {/* User Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <p className="text-4xl font-bold">{userCount}</p>
                <p className="text-blue-100 mt-2">Registered members</p>
              </motion.div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {userSearchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  Found {users.filter(u => {
                    const search = userSearchTerm.toLowerCase()
                    return u.name.toLowerCase().includes(search) ||
                           (u.email && u.email.toLowerCase().includes(search)) ||
                           (u.phone && u.phone.includes(search))
                  }).length} user(s)
                </p>
              )}
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No registered users yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.filter(user => {
                        if (!userSearchTerm) return true
                        const search = userSearchTerm.toLowerCase()
                        return user.name.toLowerCase().includes(search) ||
                               (user.email && user.email.toLowerCase().includes(search)) ||
                               (user.phone && user.phone.includes(search))
                      }).map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {user.role.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-gray-900">Payment Verification</h2>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search payments by user name, email, chapter, or reference..."
                  value={paymentSearchTerm}
                  onChange={(e) => setPaymentSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {paymentSearchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  Found {payments.filter(p => {
                    const search = paymentSearchTerm.toLowerCase()
                    return p.userName.toLowerCase().includes(search) ||
                           p.userEmail.toLowerCase().includes(search) ||
                           p.chapterTitle.toLowerCase().includes(search) ||
                           p.paymentReference.toLowerCase().includes(search)
                  }).length} payment(s)
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    paymentFilter === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setPaymentFilter('approved')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    paymentFilter === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setPaymentFilter('rejected')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    paymentFilter === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    paymentFilter === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No {paymentFilter !== 'all' ? paymentFilter : ''} payment submissions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.filter(payment => {
                        if (!paymentSearchTerm) return true
                        const search = paymentSearchTerm.toLowerCase()
                        return payment.userName.toLowerCase().includes(search) ||
                               payment.userEmail.toLowerCase().includes(search) ||
                               payment.chapterTitle.toLowerCase().includes(search) ||
                               payment.paymentReference.toLowerCase().includes(search)
                      }).map((payment) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{payment.userName}</div>
                            <div className="text-sm text-gray-500">{payment.userEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{payment.bookTitle}</div>
                            <div className="text-sm text-gray-500">
                              {payment.purchaseType === 'pdf' ? (
                                <span className="inline-flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Full PDF Book
                                </span>
                              ) : (
                                `Ch ${payment.chapterOrder}: ${payment.chapterTitle}`
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">R {payment.price}</div>
                          </td>
                          <td className="px-6 py-4">
                            {payment.proofOfPayment ? (
                              <a
                                href={payment.proofOfPayment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                View POP
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">No file</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {payment.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePaymentAction(payment.id, 'approve')}
                                  disabled={processingPayment === payment.id}
                                  className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handlePaymentAction(payment.id, 'reject', 'Payment could not be verified')}
                                  disabled={processingPayment === payment.id}
                                  className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {payment.status !== 'pending' && (
                              <div className="text-xs text-gray-500">
                                {payment.adminNote || <span className="capitalize">{payment.status}</span>}
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-gray-600" />
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* General Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Type
                    </label>
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="logoType"
                          value="text"
                          checked={settings.logoType === 'text'}
                          onChange={(e) => setSettings({ ...settings, logoType: e.target.value })}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm text-gray-700">Text Logo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="logoType"
                          value="image"
                          checked={settings.logoType === 'image'}
                          onChange={(e) => setSettings({ ...settings, logoType: e.target.value })}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm text-gray-700">Image Logo</span>
                      </label>
                    </div>
                    {settings.logoType === 'text' ? (
                      <input
                        type="text"
                        value={settings.logoText}
                        onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                        placeholder="Enter logo text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 disabled:opacity-50"
                        />
                        {uploadingLogo && (
                          <p className="text-sm text-gray-600">Uploading...</p>
                        )}
                        {settings.logoImage && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">Current logo:</p>
                            <img 
                              src={settings.logoImage} 
                              alt="Logo preview" 
                              className="h-12 w-auto object-contain border border-gray-200 rounded p-2"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Book Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Book Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Download PDF - Card Payment (ZAR)
                    </label>
                    <input
                      type="number"
                      value={settings.downloadPriceCard}
                      onChange={(e) => setSettings({ ...settings, downloadPriceCard: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Download PDF - Bank Transfer (ZAR)
                    </label>
                    <input
                      type="number"
                      value={settings.downloadPriceBank}
                      onChange={(e) => setSettings({ ...settings, downloadPriceBank: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unlock Chapter - Card Payment (ZAR)
                    </label>
                    <input
                      type="number"
                      value={settings.unlockChapterPriceCard}
                      onChange={(e) => setSettings({ ...settings, unlockChapterPriceCard: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unlock Chapter - Bank Transfer (ZAR)
                    </label>
                    <input
                      type="number"
                      value={settings.unlockChapterPriceBank}
                      onChange={(e) => setSettings({ ...settings, unlockChapterPriceBank: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="ZAR">ZAR - South African Rand</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Bank Transfer Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={settings.bankName}
                          onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                          placeholder="e.g., FNB, Standard Bank"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Holder
                        </label>
                        <input
                          type="text"
                          value={settings.accountHolder}
                          onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                          placeholder="Account holder name"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={settings.accountNumber}
                          onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                          placeholder="Account number"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Branch Code
                          </label>
                          <input
                            type="text"
                            value={settings.branchCode}
                            onChange={(e) => setSettings({ ...settings, branchCode: e.target.value })}
                            placeholder="Branch code"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Account Type
                          </label>
                          <input
                            type="text"
                            value={settings.accountType}
                            onChange={(e) => setSettings({ ...settings, accountType: e.target.value })}
                            placeholder="e.g., Cheque, Savings"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.autoLogoutInactivity}
                        onChange={(e) => setSettings({ ...settings, autoLogoutInactivity: e.target.checked })}
                        className="w-4 h-4 text-red-600 rounded" 
                      />
                      <span className="text-sm text-gray-700">Auto-logout after inactivity</span>
                    </label>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Change Password
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Save Button */}
            <div className="mt-6">
              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSettings ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Books</h2>
                <p className="text-gray-600">Create, edit, and manage your book collection</p>
              </div>
              <div className="grid grid-cols-1 sm:flex sm:gap-3 gap-3">
                <button
                  onClick={() => router.push('/admin/books/unlocks')}
                  className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg sm:shadow-none hover:shadow-xl sm:hover:shadow-none"
                >
                  <Lock className="w-5 h-5" />
                  <span>Unlock Chapters</span>
                </button>
                <button
                  onClick={() => router.push('/admin/books/new')}
                  className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg sm:shadow-none hover:shadow-xl sm:hover:shadow-none"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Book</span>
                </button>
              </div>
            </div>

            {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first book</p>
            <button
              onClick={() => router.push('/admin/books/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Your First Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {book.coverImage && (
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{book.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      book.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : book.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {book.status === 'completed' ? 'Completed' : book.status === 'in_progress' ? 'In Progress' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {book.genre && (
                      <span className="flex items-center gap-1">
                        <Book className="w-4 h-4" />
                        {book.genre}
                      </span>
                    )}
                    {book._count && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {book._count.chapters} chapters
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/books/${book.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(book.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                Change Password
              </h3>
              
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    setPasswordError('')
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  Delete Book
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete this book? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setBookToDelete(null)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Review Modal */}
      <AnimatePresence>
        {showReviewModal && paymentToReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  Review Payment
                </h3>
                <button
                  onClick={() => {
                    setShowReviewModal(false)
                    setPaymentToReview(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="font-semibold">{paymentToReview.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Book</p>
                    <p className="font-semibold">{paymentToReview.bookTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chapter</p>
                    <p className="font-semibold">{paymentToReview.chapterTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold">R {paymentToReview.price}</p>
                  </div>
                </div>

                {/* Proof of Payment Section */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Proof of Payment (POP)</p>
                  {paymentToReview.proofOfPayment ? (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <FileUp className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">POP File Uploaded</p>
                          <p className="text-sm text-gray-500">Click below to view the proof of payment</p>
                        </div>
                      </div>
                      <a
                        href={paymentToReview.proofOfPayment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View POP
                      </a>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                      <p className="text-yellow-700">
                        No POP file uploaded. User submitted payment reference only.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowReviewModal(false)
                    setPaymentToReview(null)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handlePaymentAction(paymentToReview.id, 'reject', 'Payment could not be verified')
                    setShowReviewModal(false)
                    setPaymentToReview(null)
                  }}
                  disabled={processingPayment === paymentToReview.id}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handlePaymentAction(paymentToReview.id, 'approve')
                    setShowReviewModal(false)
                    setPaymentToReview(null)
                  }}
                  disabled={processingPayment === paymentToReview.id}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
