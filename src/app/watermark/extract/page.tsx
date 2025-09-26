'use client'

import { apiEndpoints } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useState } from 'react'

export default function WatermarkExtract() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [watermark, setWatermark] = useState<string | null>(null)
  const { isAuthenticated, role } = useAuth()

  const resetState = () => {
    setVideoFile(null)
    setLoading(false)
    setMessage('')
    setWatermark(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile) {
      setMessage('비디오 파일을 선택해주세요.')
      return
    }

    setLoading(true)
    setMessage('')
    setWatermark(null)
    const formData = new FormData()
    formData.append('video', videoFile)

    try {
      const response = await fetch(apiEndpoints.extract, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        setMessage('워터마크 추출 성공!')
        setWatermark(data.watermark) // 서버 응답에 맞게 `data.watermark` 사용
      } else {
        setMessage(`오류: ${data.error || '추출에 실패했습니다.'}`)
      }
    } catch (error) {
      setMessage('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoFile(e.target.files?.[0] || null)
    setMessage('')
    setWatermark(null)
  }

  // --- 접근 제어 로직 ---
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

  // --- 접근 제어 로직 끝 ---

  return (
    <div className="text-gray-800 font-sans">
      <div className="container mx-auto px-6 py-20 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            유출된 영상에서
            <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              숨겨진 서명
            </span>
            을 찾습니다
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            DDW의 워터마크 추출 기술은 원본의 손상 없이도 유출자를 정확하게
            식별할 수 있습니다.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mt-16">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="video-upload" className="cursor-pointer group">
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-72 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed transition-all duration-300 ${
                    videoFile
                      ? 'border-red-500'
                      : 'border-gray-300 group-hover:border-red-400'
                  }`}
                >
                  {videoFile ? (
                    <div className="text-center p-4">
                      <VideoIcon className="mx-auto h-16 w-16 text-red-500" />
                      <p className="mt-4 text-lg font-semibold text-gray-800 truncate max-w-full">
                        {videoFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={resetState}
                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        파일 변경
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-red-500 transition-colors" />
                      <p className="mt-4 text-lg font-semibold text-gray-700">
                        클릭하거나 파일을 드래그하여 업로드
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        워터마크가 삽입된 비디오 파일 (.mkv, .mp4)
                      </p>
                    </div>
                  )}
                </div>
              </label>
              <input
                id="video-upload"
                type="file"
                accept="video/mkv,video/mp4,video/*"
                className="sr-only"
                onChange={handleFileChange}
                onClick={(e) => {
                  ;(e.target as HTMLInputElement).value = ''
                }}
              />
            </div>

            {videoFile && !loading && !watermark && (
              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="w-full max-w-xs mx-auto flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-red-500/50 hover:scale-105 transform"
                >
                  워터마크 추출하기
                </button>
              </div>
            )}
          </form>
        </div>

        {(loading || message || watermark) && (
          <div className="max-w-3xl mx-auto mt-20 text-center">
            {loading && (
              <div className="space-y-4">
                <LoadingSpinner />
                <p className="text-lg text-gray-600">
                  워터마크를 추출하고 있습니다...
                </p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
              </div>
            )}

            {message && !loading && (
              <div
                className={`p-4 rounded-lg text-sm font-medium mb-8 ${
                  message.includes('성공')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            {watermark && (
              <div className="mt-8 space-y-8">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg ring-1 ring-black/5 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <InfoIcon className="h-6 w-6 mr-2 text-blue-600" />
                    추출된 워터마크 정보
                  </h3>
                  <pre className="mt-2 whitespace-pre-wrap break-all bg-gray-100 p-4 rounded-lg text-gray-800 font-mono text-sm">
                    <code>{watermark}</code>
                  </pre>
                </div>
                <button
                  onClick={resetState}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-800"
                >
                  다른 영상 분석하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- 아이콘 컴포넌트 추가 ---
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
)

const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9a2.25 2.25 0 00-2.25 2.25v9A2.25 2.25 0 004.5 18.75z"
    />
  </svg>
)

const LoadingSpinner = () => (
  <svg
    className="mx-auto animate-spin h-8 w-8 text-red-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
)
