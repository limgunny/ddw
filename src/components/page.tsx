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

export default function AdminDashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, role, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      setLoading(false)
      return
    }

    const fetchVideos = async () => {
      try {
        const response = await fetch(apiEndpoints.admin.allVideos, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.msg || 'Failed to fetch videos')
        }
        const data: Video[] = await response.json()
        setVideos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [token, isAuthenticated, role])

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
    return <div className="text-center p-8">전체 비디오 목록 로딩 중...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">오류: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          관리자 대시보드: 전체 비디오 목록
        </h1>
        {videos.length === 0 ? (
          <p className="text-center text-gray-500">
            업로드된 비디오가 없습니다.
          </p>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <ul role="list" className="divide-y divide-gray-200">
              {videos.map((video) => (
                <li
                  key={video.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-600 truncate">
                      {video.original_filename}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      업로더: {video.user.username} / 시각:{' '}
                      {new Date(video.upload_timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
