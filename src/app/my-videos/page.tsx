'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiEndpoints } from '@/lib/api'

// 백엔드에서 받아올 비디오 데이터의 타입을 정의합니다.
interface Video {
  id: number
  original_filename: string
  playback_filename: string
  upload_timestamp: string
  user: { username: string }
}

// 비디오 정보를 표시할 카드 컴포넌트입니다.
const VideoCard = ({ video }: { video: Video }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black/5">
    <h3 className="text-lg font-bold text-gray-900 truncate">
      {video.original_filename}
    </h3>
    <p className="text-sm text-gray-500 mt-1">
      업로드: {new Date(video.upload_timestamp).toLocaleString('ko-KR')}
    </p>
    <div className="mt-4 flex flex-col sm:flex-row gap-3">
      <a
        href={apiEndpoints.outputs(video.playback_filename)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto flex-grow text-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-full shadow-md hover:bg-purple-700 transition-all"
      >
        영상 재생
      </a>
    </div>
  </div>
)

export default function MyVideosPage() {
  const { isAuthenticated, token } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        // 백엔드에 '내 비디오 목록'을 요청하는 API 엔드포인트입니다.
        const response = await fetch(apiEndpoints.myVideos, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(
            data.error || '내 비디오 목록을 불러오는 데 실패했습니다.'
          )
        }

        const data: Video[] = await response.json()
        setVideos(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [isAuthenticated, token])

  if (!isAuthenticated && !loading) {
    return (
      <div className="text-center p-8">
        <p className="text-lg">로그인이 필요합니다.</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-purple-600 hover:underline"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-20 sm:py-24 lg:py-32">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
          내 비디오 목록
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          워터마크가 삽입된 비디오 목록입니다.
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <p>로딩 중...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
          <p>오류: {error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>업로드된 비디오가 없습니다.</p>
          <Link
            href="/watermark/insert"
            className="mt-4 inline-block text-purple-600 hover:underline"
          >
            첫 비디오 업로드하기
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
