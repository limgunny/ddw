'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiEndpoints } from '@/lib/api'

interface Video {
  id: number
  original_filename: string
  playback_filename: string
  upload_timestamp: string
  user: {
    username: string
  }
}

interface User {
  id: number
  username: string
  role: string
}

export default function AdminDashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState('videos') // 'videos' or 'users'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, role, userId, isAuthenticated } = useAuth()

  const handleDelete = async (videoId: number) => {
    if (
      !window.confirm(
        '정말로 이 비디오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(apiEndpoints.admin.deleteVideo(videoId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.msg || data.error || '비디오 삭제에 실패했습니다.')
      }

      // UI에서 즉시 삭제된 비디오를 제거하여 새로고침 없이 반영
      setVideos((currentVideos) =>
        currentVideos.filter((video) => video.id !== videoId)
      )

      const data = await response.json()
      alert(data.message || '비디오가 성공적으로 삭제되었습니다.')
    } catch (err: any) {
      alert(`오류: ${err.message}`)
      setError(err.message) // 에러 상태에도 기록
    }
  }

  const handleUserDelete = async (userToDeleteId: number, username: string) => {
    if (
      !window.confirm(
        `정말로 사용자 '${username}'을(를) 삭제하시겠습니까? 이 사용자의 모든 비디오도 함께 삭제됩니다.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        apiEndpoints.admin.deleteUser(userToDeleteId),
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.msg || '사용자 삭제에 실패했습니다.')
      }

      alert(data.message || `사용자 '${username}'이 성공적으로 삭제되었습니다.`)
      // UI에서 사용자 및 해당 사용자의 비디오를 제거
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userToDeleteId)
      )
      setVideos((currentVideos) =>
        currentVideos.filter((video) => video.user.username !== username)
      )
    } catch (err: any) {
      alert(`오류: ${err.message}`)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // 두 API를 동시에 호출하여 데이터를 가져옵니다.
        const [videosResponse, usersResponse] = await Promise.all([
          fetch(apiEndpoints.admin.allVideos, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
          fetch(apiEndpoints.admin.allUsers, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
        ])

        if (!videosResponse.ok) throw new Error('비디오 목록 로딩 실패')
        if (!usersResponse.ok) throw new Error('사용자 목록 로딩 실패')

        const videosData: Video[] = await videosResponse.json()
        const usersData: User[] = await usersResponse.json()

        setVideos(videosData)
        setUsers(usersData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, isAuthenticated, role]) // 의존성 배열은 그대로 유지

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

  if (role !== 'admin') {
    return (
      <div className="text-center p-8 text-red-500">
        접근 권한이 없습니다. 이 페이지는 관리자만 볼 수 있습니다.
      </div>
    )
  }

  if (loading) {
    return <div className="text-center p-8">관리자 데이터 로딩 중...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">오류: {error}</div>
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          관리자 대시보드
        </h1>
        <div className="mb-8 border-b border-gray-200">
          <nav
            className="-mb-px flex justify-center space-x-8"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab('videos')}
              className={`${
                activeTab === 'videos'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              비디오 관리 ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              사용자 관리 ({users.length})
            </button>
          </nav>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
          {activeTab === 'videos' && (
            <div>
              {videos.length === 0 ? (
                <p className="text-center text-gray-500 p-8">
                  업로드된 비디오가 없습니다.
                </p>
              ) : (
                <ul role="list" className="divide-y divide-gray-200">
                  {videos.map((video) => (
                    <li
                      key={video.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-600 truncate">
                          {video.original_filename}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          업로더:{' '}
                          <span className="font-semibold">
                            {video.user.username}
                          </span>{' '}
                          / 시각:{' '}
                          {new Date(video.upload_timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 space-x-2">
                        <a
                          href={`http://localhost:5000/outputs/${video.playback_filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          재생
                        </a>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              {users.length === 0 ? (
                <p className="text-center text-gray-500 p-8">
                  등록된 사용자가 없습니다.
                </p>
              ) : (
                <ul role="list" className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          ID: {user.id}
                        </p>
                        <p className="text-sm text-gray-700 truncate">
                          Username: {user.username}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role}
                        </span>
                        <button
                          onClick={() =>
                            handleUserDelete(user.id, user.username)
                          }
                          disabled={user.id === userId || user.role === 'admin'}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            현재 총 {videos.length}개의 비디오와 {users.length}명의 사용자가
            있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
