// e:\video-watermarker\frontend\src\app\profile\page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiEndpoints } from '@/lib/api'

export default function ProfilePage() {
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // State for account deletion
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

  const { token, isAuthenticated, logout } = useAuth()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (newPassword !== confirmPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (!token) {
      setMessage('로그인이 필요합니다.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(apiEndpoints.profile.changePassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const errorMessage =
          data.error || data.msg || '알 수 없는 오류가 발생했습니다.'
        setMessage(`오류: ${errorMessage}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('An error occurred during fetch:', error)
      }
      setMessage('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteMessage('')

    if (
      !window.confirm(
        '정말로 계정을 삭제하시겠습니까? 모든 비디오와 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    if (!token) {
      setDeleteMessage('로그인이 필요합니다.')
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch(apiEndpoints.profile.deleteAccount, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await response.json()
      if (response.ok) {
        alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.')
        logout() // AuthContext의 logout 함수 호출
      } else {
        setDeleteMessage(`오류: ${data.error || data.msg || '알 수 없는 오류'}`)
      }
    } catch {
      setDeleteMessage('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        로그인이 필요합니다.{' '}
        <Link href="/login" className="text-blue-600">
          로그인 페이지로
        </Link>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-md mx-auto ">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-black/10 p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            비밀번호 변경
          </h1>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700"
              >
                현재 비밀번호
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                새 비밀번호
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                새 비밀번호 확인
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 text-center text-sm ${
                message.includes('성공') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="bg-red-50/60 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-red-500/20 p-8 mt-12">
          <h2 className="text-2xl font-bold text-red-700 text-center mb-6">
            회원 탈퇴
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은
            되돌릴 수 없습니다.
          </p>
          <form onSubmit={handleAccountDelete} className="space-y-6">
            <div>
              <label
                htmlFor="delete-password"
                className="block text-sm font-medium text-gray-700"
              >
                계정 확인을 위해 비밀번호를 입력하세요
              </label>
              <input
                type="password"
                id="delete-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={deleteLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            >
              {deleteLoading ? '삭제 중...' : '회원 탈퇴'}
            </button>
          </form>
          {deleteMessage && (
            <div className={`mt-4 text-center text-sm text-red-600`}>
              {deleteMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
