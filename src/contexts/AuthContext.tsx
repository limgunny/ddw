'use client'

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'

interface AuthContextType {
  token: string | null
  role: string | null
  userId: number | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      try {
        // JWT 페이로드에 대한 타입 정의
        const decoded: { sub: string; iat: number; exp: number } =
          jwtDecode(storedToken)
        const identity = JSON.parse(decoded.sub)
        setToken(storedToken)
        setRole(identity.role || null)
        setUserId(identity.id || null)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to decode token:', error)
        }
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    try {
      const decoded: { sub: string } = jwtDecode(newToken) // 타입은 필요에 따라 더 구체화 가능
      const identity = JSON.parse(decoded.sub)
      setRole(identity.role || null)
      setUserId(identity.id || null)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to decode token on login:', error)
      }
      setRole(null)
      setUserId(null)
    }
  }

  const logout = () => {
    setToken(null)
    setRole(null)
    setUserId(null)
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{ token, role, userId, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
