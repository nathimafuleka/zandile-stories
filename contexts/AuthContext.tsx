'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

interface User {
  id: string
  email?: string
  phone?: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (emailOrPhone: string, password: string, isPhone?: boolean) => Promise<void>
  register: (name: string, email?: string, password?: string, phone?: string) => Promise<void>
  logout: () => void
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(true)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (user && autoLogoutEnabled) {
      startInactivityTimer()
      setupActivityListeners()
    } else {
      clearInactivityTimer()
      removeActivityListeners()
    }

    return () => {
      clearInactivityTimer()
      removeActivityListeners()
    }
  }, [user, autoLogoutEnabled])

  const startInactivityTimer = () => {
    clearInactivityTimer()
    inactivityTimerRef.current = setTimeout(() => {
      console.log('User inactive - auto logout')
      logout()
    }, INACTIVITY_TIMEOUT)
  }

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
  }

  const resetInactivityTimer = () => {
    if (user && autoLogoutEnabled) {
      startInactivityTimer()
    }
  }

  const setupActivityListeners = () => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer)
    })
  }

  const removeActivityListeners = () => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    events.forEach(event => {
      window.removeEventListener(event, resetInactivityTimer)
    })
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setAutoLogoutEnabled(data.settings.autoLogoutInactivity)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Default to enabled if fetch fails
      setAutoLogoutEnabled(true)
    }
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid or expired, clear it
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email?: string, password?: string, phone?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } catch (error) {
      throw error
    }
  }

  const login = async (emailOrPhone: string, password: string, isPhone?: boolean) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: isPhone ? undefined : emailOrPhone,
          phone: isPhone ? emailOrPhone : undefined,
          password 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    clearInactivityTimer()
    removeActivityListeners()
    setUser(null)
    localStorage.removeItem('token')
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Password update failed')
      }
    } catch (error) {
      throw error
    }
  }

  const deleteAccount = async (password: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Account deletion failed')
      }

      logout()
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
