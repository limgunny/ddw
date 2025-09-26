// e:\video-watermarker\frontend\src\components\HeaderNav.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function HeaderNav() {
  const { isAuthenticated, role, logout } = useAuth()

  return (
    <nav className="flex items-center space-x-8">
      <Link
        href="/about"
        className="text-purple-700 hover:text-purple-900 transition-colors duration-200"
      >
        소개
      </Link>
      <Link
        href="/watermark/insert"
        className="text-purple-700 hover:text-purple-900 transition-colors duration-200"
      >
        영상 업로드
      </Link>
      <Link
        href="/watermark/extract"
        className="text-purple-700 hover:text-purple-900 transition-colors duration-200"
      >
        유출자 추적
      </Link>
      {isAuthenticated && role === 'admin' && (
        <>
          <Link
            href="/admin/dashboard"
            className="font-bold text-red-600 hover:text-red-800 transition-colors duration-200"
          >
            관리자
          </Link>
        </>
      )}
      {isAuthenticated ? (
        <>
          <Link
            href="/my-videos"
            className="text-purple-700 hover:text-purple-900 transition-colors duration-200"
          >
            내 비디오
          </Link>
          <Link
            href="/profile"
            className="text-purple-700 hover:text-purple-900 transition-colors duration-200"
          >
            프로필
          </Link>
          <button
            onClick={logout}
            className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-purple-700 hover:text-purple-900 font-medium transition-colors duration-200"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  )
}
