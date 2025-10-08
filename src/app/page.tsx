'use client'

import { useEffect, useState, memo, useCallback } from 'react'
import CtaButton from '@/components/CtaButton'
import { apiEndpoints } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type Video = {
  id: number
  title?: string | null
  original_filename: string
  playback_filename: string
  thumbnail_filename?: string | null
  upload_timestamp: string
  views: number
  user: { id: number; username: string }
}

// 메모이제이션된 비디오 카드 컴포넌트
const VideoCard = memo(
  ({
    video,
    isAuthenticated,
    userId,
    token,
    onVideoClick,
    onVideoDelete,
  }: {
    video: Video
    isAuthenticated: boolean
    userId: number | null
    token: string | null
    onVideoClick: (video: Video) => void
    onVideoDelete: (videoId: number) => void
  }) => (
    <div className="group rounded-2xl overflow-hidden bg-white shadow ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
      <button onClick={() => onVideoClick(video)} className="w-full text-left">
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          {video.thumbnail_filename ? (
            <img
              src={apiEndpoints.outputs(video.thumbnail_filename)}
              alt={video.original_filename}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              썸네일 없음
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-12 h-12 text-white drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>
      <div className="p-4">
        <div
          className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]"
          title={video.title || video.original_filename}
        >
          {video.title || video.original_filename}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold max-w-[80%] whitespace-nowrap text-center">
              {video.user.username}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span>{video.views?.toLocaleString()}회 시청</span>
            <span>
              · {new Date(video.upload_timestamp).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
        {isAuthenticated && userId === video.user.id && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onVideoDelete(video.id)}
              className="px-3 py-1 text-xs rounded-full bg-red-50 text-red-600 hover:bg-red-100"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
)

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { isAuthenticated, userId, token } = useAuth()

  // 로컬 스토리지의 오래된 조회 기록 정리 (24시간 이상 된 기록 삭제)
  const cleanupOldViewRecords = () => {
    const now = Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000 // 24시간

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('viewed_video_')) {
        const timestamp = parseInt(localStorage.getItem(key) || '0')
        if (now - timestamp > oneDayInMs) {
          localStorage.removeItem(key)
        }
      }
    }
  }

  // 비디오 로드 함수 (페이지네이션 지원)
  const loadVideos = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) setLoading(true)
      setError(null)

      const res = await fetch(
        `${apiEndpoints.videos}?page=${pageNum}&per_page=12`
      )
      const data: Video[] = await res.json()

      if (append) {
        setVideos((prev) => [...prev, ...data])
      } else {
        setVideos(data)
      }

      // 더 이상 로드할 데이터가 없는지 확인
      setHasMore(data.length === 12)
    } catch {
      setError('영상을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 더 많은 비디오 로드
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadVideos(nextPage, true)
    }
  }, [loading, hasMore, page])

  // 비디오 클릭 핸들러
  const handleVideoClick = useCallback(async (video: Video) => {
    // 로컬 스토리지에서 중복 조회 방지
    const viewedKey = `viewed_video_${video.id}`
    const hasViewed = localStorage.getItem(viewedKey)

    try {
      // 조회수 증가 API 호출
      const viewResponse = await fetch(apiEndpoints.video.view(video.id), {
        method: 'POST',
      })

      if (viewResponse.ok) {
        // API 응답에서 실제 조회수 받아서 UI 업데이트
        const viewData = await viewResponse.json()
        setVideos((prev) =>
          prev.map((it) =>
            it.id === video.id ? { ...it, views: viewData.views } : it
          )
        )

        // 로컬 스토리지에 조회 기록 저장 (24시간 유지)
        if (!viewData.already_viewed && !hasViewed) {
          localStorage.setItem(viewedKey, Date.now().toString())
        }
      } else {
        // API 실패 시 개발 환경에서만 로그 표시
        if (process.env.NODE_ENV === 'development') {
          console.warn('조회수 증가 실패:', await viewResponse.text())
        }
      }
    } catch (error) {
      // 네트워크 오류 등으로 실패해도 재생은 계속 진행 (개발 환경에서만 로그 표시)
      if (process.env.NODE_ENV === 'development') {
        console.warn('조회수 증가 중 오류:', error)
      }
    }

    // 비디오 재생
    window.open(apiEndpoints.outputs(video.playback_filename), '_blank')
  }, [])

  // 비디오 삭제 핸들러
  const handleVideoDelete = useCallback(
    async (videoId: number) => {
      if (!token) return
      const confirmDel = window.confirm('이 비디오를 삭제하시겠습니까?')
      if (!confirmDel) return

      try {
        const res = await fetch(apiEndpoints.video.delete(videoId), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => ({} as Record<string, unknown>))
          alert(data.error || '삭제에 실패했습니다.')
          return
        }
        setVideos((prev) => prev.filter((it) => it.id !== videoId))
      } catch {
        alert('삭제 중 오류가 발생했습니다.')
      }
    },
    [token]
  )

  useEffect(() => {
    // 페이지 로드 시 오래된 조회 기록 정리
    cleanupOldViewRecords()

    // 초기 비디오 로드
    loadVideos(1, false)
  }, [])

  return (
    <main className="text-gray-800">
      {/* Hero Section (소개 상단 블록) */}
      <div className="relative pt-12 pb-8 text-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_120px,#d5c5ff,transparent)]"></div>
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-normal bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent break-words">
            Dynamic Digital Watermarking
          </h1>

          <p className="mt-3 max-w-3xl mx-auto text-base md:text-lg text-gray-600">
            당신의 소중한 영상 콘텐츠를 보호하세요. 육안으로 식별 불가능한
            워터마크로 유출자를 정확히 추적하고, 콘텐츠의 가치를 지킵니다.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaButton
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-7 py-3 text-sm md:text-base font-medium text-white shadow-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 transform hover:shadow-purple-500/50"
              authText="지금 영상 업로드"
              guestText="지금 영상 업로드"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              최신 영상
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              가장 최근에 업로드된 워터마크 영상들을 만나보세요
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 rounded-full bg-gray-100">최신순</span>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-white shadow ring-1 ring-black/5"
              >
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-600">아직 업로드된 영상이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                isAuthenticated={isAuthenticated}
                userId={userId}
                token={token}
                onVideoClick={handleVideoClick}
                onVideoDelete={handleVideoDelete}
              />
            ))}
          </div>
        )}

        {/* 더 보기 버튼 */}
        {videos.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
            >
              {loading ? '로딩 중...' : '더 많은 영상 보기'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
