'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiEndpoints } from '@/lib/api'

// New SVG Icons
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
    className="mx-auto animate-spin h-8 w-8 text-purple-600"
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

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
)

export default function WatermarkInsert() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const [masterUrl, setMasterUrl] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'processing' | 'completed' | 'failed'
  >('idle')
  const { token, refreshToken, refreshAccessToken, isAuthenticated } = useAuth()

  const resetState = () => {
    setMessage('')
    setPlaybackUrl(null)
    setMasterUrl(null)
    setVideoFile(null)
    setTaskId(null)
    setProgress(0)
    setProcessingStatus('idle')
  }

  // 작업 상태 폴링 함수
  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(apiEndpoints.embedStatus(taskId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('작업 상태 조회 실패')
      }

      const data = await response.json()
      setProgress(data.progress)

      if (data.status === 'completed') {
        setProcessingStatus('completed')
        setMessage(data.message || '워터마킹이 완료되었습니다.')

        // URL 설정
        const pUrl = data.playback_file
          ? apiEndpoints.outputs(data.playback_file)
          : null
        const mUrl = data.master_file
          ? apiEndpoints.outputs(data.master_file)
          : null
        setPlaybackUrl(pUrl)
        setMasterUrl(mUrl)

        setLoading(false)
      } else if (data.status === 'failed') {
        setProcessingStatus('failed')
        setMessage(`오류: ${data.error}`)
        setLoading(false)
      } else if (data.status === 'running') {
        // 계속 폴링
        setTimeout(() => pollTaskStatus(taskId), 2000) // 2초마다 폴링
      }
    } catch (error) {
      console.error('작업 상태 조회 오류:', error)
      setProcessingStatus('failed')
      setMessage('작업 상태 조회 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile) {
      setMessage('비디오 파일을 선택해주세요.')
      return
    }
    if (!token) {
      setMessage('로그인이 필요합니다.')
      return
    }

    setMessage('')
    setPlaybackUrl(null)
    setMasterUrl(null)
    setLoading(true)
    setProcessingStatus('processing')
    setProgress(0)

    const formData = new FormData()
    formData.append('video', videoFile)
    if (title) formData.append('title', title)

    try {
      const response = await fetch(apiEndpoints.embed, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.task_id) {
        setTaskId(data.task_id)
        setMessage('워터마킹 작업이 시작되었습니다.')
        // 작업 상태 폴링 시작
        pollTaskStatus(data.task_id)
      } else {
        setProcessingStatus('failed')
        const errorMessage =
          data.error || data.msg || '알 수 없는 오류가 발생했습니다.'
        setMessage(`오류: ${errorMessage}`)
        setLoading(false)
      }
    } catch (error) {
      console.error('업로드 오류:', error)
      setProcessingStatus('failed')
      setMessage('서버와 통신 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage('')
    setPlaybackUrl(null)
    setMasterUrl(null)

    const file = e.target.files?.[0] || null

    if (file && !file.type.startsWith('video/')) {
      setMessage('오류: 비디오 파일만 업로드할 수 있습니다. (예: .mp4, .mov)')
      setVideoFile(null)
      e.target.value = ''
      return
    }

    setVideoFile(file)
  }

  const handleRemoveFile = () => {
    setVideoFile(null)
    setMessage('')
    setPlaybackUrl(null)
    setMasterUrl(null)
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
    <div className="text-gray-800 font-sans">
      <div className="container mx-auto px-6 py-20 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            당신의 영상에
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              보이지 않는 서명
            </span>
            을 새기세요
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            DDW의 비가시성 워터마킹 기술로 소중한 영상 콘텐츠를 보호하고,
            어디서든 주인을 찾을 수 있게 합니다.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mt-16">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="video-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  제목
                </label>
                <input
                  id="video-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제주도 여행"
                  className="mt-1 w-full border border-black rounded-none focus:border-purple-500 focus:ring-purple-500"
                  maxLength={120}
                />
              </div>
              <label htmlFor="video-upload" className="cursor-pointer group">
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-72 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed transition-all duration-300 ${
                    videoFile
                      ? 'border-purple-500'
                      : 'border-gray-300 group-hover:border-purple-400'
                  }`}
                >
                  {videoFile ? (
                    <div className="text-center p-4">
                      <VideoIcon className="mx-auto h-16 w-16 text-purple-500" />
                      <p className="mt-4 text-lg font-semibold text-gray-800 truncate max-w-full">
                        {videoFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        파일 변경
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <p className="mt-4 text-lg font-semibold text-gray-700">
                        클릭하거나 파일을 드래그하여 업로드
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        MP4, MOV, AVI 등 모든 비디오 형식을 지원합니다.
                      </p>
                    </div>
                  )}
                </div>
              </label>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={handleFileChange}
                onClick={(e) => {
                  ;(e.target as HTMLInputElement).value = ''
                }}
              />
            </div>

            {videoFile && processingStatus === 'idle' && (
              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="w-full max-w-xs mx-auto flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-purple-500/50 hover:scale-105 transform"
                >
                  워터마크 삽입하기
                </button>
              </div>
            )}
          </form>
        </div>

        {(loading || message || playbackUrl) && (
          <div className="max-w-3xl mx-auto mt-20 text-center">
            {processingStatus === 'processing' && (
              <div className="space-y-6">
                <LoadingSpinner />
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    워터마크 삽입 중...
                  </h3>
                  <div className="max-w-md mx-auto">
                    <ProgressBar progress={progress} />
                    <p className="mt-2 text-sm text-gray-600">
                      {progress}% 완료
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>영상 길이에 따라 처리 시간이 달라집니다.</p>
                    <p>페이지를 벗어나지 마세요.</p>
                  </div>
                </div>
              </div>
            )}

            {processingStatus === 'completed' && message && (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="p-4 rounded-lg bg-green-100 text-green-800 text-sm font-medium">
                  {message}
                </div>
              </div>
            )}

            {processingStatus === 'failed' && message && (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="p-4 rounded-lg bg-red-100 text-red-800 text-sm font-medium">
                  {message}
                </div>
              </div>
            )}

            {playbackUrl && (
              <div className="mt-8 space-y-8">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
                  <video src={playbackUrl} controls className="w-full h-full">
                    브라우저가 비디오 태그를 지원하지 않습니다.
                  </video>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={playbackUrl}
                    download
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 hover:shadow-purple-500/50"
                  >
                    재생용 비디오 다운로드 (.mp4)
                  </a>
                  {masterUrl && (
                    <a
                      href={masterUrl}
                      download
                      className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-full shadow-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 hover:shadow-md"
                    >
                      [관리자용] 원본 파일 다운로드 (.mp4)
                    </a>
                  )}
                </div>
                <button
                  onClick={resetState}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-800"
                >
                  다른 영상 업로드하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
