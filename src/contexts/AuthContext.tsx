'use client'

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { apiEndpoints, apiUtils } from '@/lib/api'

interface AuthContextType {
  token: string | null
  refreshToken: string | null
  role: string | null
  userId: number | null
  login: (accessToken: string, refreshToken?: string) => void
  logout: () => void
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<boolean>
  tokenExpiryWarning: boolean
  dismissTokenWarning: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [tokenExpiryWarning, setTokenExpiryWarning] = useState(false)

  // 토큰 만료 시간 확인 함수
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded: { exp: number } = jwtDecode(token)
      const currentTime = Date.now() / 1000
      // 만료 5분 전에 갱신하도록 설정
      return decoded.exp - currentTime < 300
    } catch {
      return true
    }
  }, [])

  // 토큰 만료 경고 표시 함수
  const showTokenExpiryWarning = useCallback((token: string) => {
    try {
      const decoded: { exp: number } = jwtDecode(token)
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = decoded.exp - currentTime

      // 10분 이내 만료 시 경고 표시
      if (timeUntilExpiry < 600 && timeUntilExpiry > 0) {
        setTokenExpiryWarning(true)
      }
    } catch {
      // 토큰 디코딩 실패 시 무시
    }
  }, [])

  // 토큰 경고 해제 함수
  const dismissTokenWarning = useCallback(() => {
    setTokenExpiryWarning(false)
  }, [])

  // 토큰 자동 갱신 함수
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      return false
    }

    try {
      const response = await apiUtils.fetchWithTimeout(
        apiEndpoints.refresh,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
        },
        10000
      )

      if (response.ok) {
        const data = await response.json()
        const newAccessToken = data.access_token

        setToken(newAccessToken)
        localStorage.setItem('token', newAccessToken)

        // 새로운 토큰으로 사용자 정보 업데이트
        try {
          const decoded: { sub: string } = jwtDecode(newAccessToken)
          const identity = JSON.parse(decoded.sub)
          setRole(identity.role || null)
          setUserId(identity.id || null)
        } catch (error) {
          console.error('Failed to decode refreshed token:', error)
        }

        return true
      } else {
        // 리프레시 토큰도 만료된 경우
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }, [refreshToken])

  // 토큰 상태 초기화
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedToken) {
      try {
        const decoded: { sub: string; iat: number; exp: number } =
          jwtDecode(storedToken)
        const identity = JSON.parse(decoded.sub)

        // 토큰이 만료되었는지 확인
        if (isTokenExpired(storedToken)) {
          // 만료된 경우 리프레시 토큰으로 갱신 시도
          if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken)
            refreshAccessToken()
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
        } else {
          setToken(storedToken)
          setRole(identity.role || null)
          setUserId(identity.id || null)
        }
      } catch (error) {
        console.error('Failed to decode token:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken)
    }
  }, [isTokenExpired, refreshAccessToken])

  // 주기적으로 토큰 만료 확인 및 갱신
  useEffect(() => {
    if (!token || !refreshToken) return

    const checkTokenExpiry = async () => {
      // 먼저 경고 표시 여부 확인
      showTokenExpiryWarning(token)

      // 만료된 경우 갱신
      if (isTokenExpired(token)) {
        await refreshAccessToken()
      }
    }

    // 5분마다 토큰 만료 확인
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [
    token,
    refreshToken,
    isTokenExpired,
    refreshAccessToken,
    showTokenExpiryWarning,
  ])

  const login = (accessToken: string, newRefreshToken?: string) => {
    setToken(accessToken)
    localStorage.setItem('token', accessToken)

    if (newRefreshToken) {
      setRefreshToken(newRefreshToken)
      localStorage.setItem('refreshToken', newRefreshToken)
    }

    try {
      const decoded: { sub: string } = jwtDecode(accessToken)
      const identity = JSON.parse(decoded.sub)
      setRole(identity.role || null)
      setUserId(identity.id || null)
    } catch (error) {
      console.error('Failed to decode token on login:', error)
      setRole(null)
      setUserId(null)
    }
  }

  const logout = () => {
    setToken(null)
    setRefreshToken(null)
    setRole(null)
    setUserId(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        role,
        userId,
        login,
        logout,
        isAuthenticated,
        refreshAccessToken,
        tokenExpiryWarning,
        dismissTokenWarning,
      }}
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
