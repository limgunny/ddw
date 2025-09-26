'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import DDWLogo from '@/components/DDWLogo'
import { apiEndpoints } from '@/lib/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('API URL:', apiEndpoints.login)
      const response = await fetch(apiEndpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        login(data.access_token)
        router.push('/') // 로그인 후 메인 페이지로 이동
      } else {
        setMessage(`오류: ${data.error}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block" aria-label="DDW 홈으로">
            <DDWLogo className="h-12 w-auto mx-auto" />
          </Link>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정에 로그인하여 콘텐츠를 보호하세요.
          </p>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/60 backdrop-blur-sm py-8 px-4 shadow-2xl ring-1 ring-black/10 sm:rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  사용자 이름
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  비밀번호
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 transition-all duration-300 hover:shadow-purple-500/50"
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </div>
            </form>

            {message && (
              <p className="mt-4 text-center text-sm text-red-600">{message}</p>
            )}

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                아직 회원이 아니신가요?{' '}
                <Link
                  href="/signup"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  가입하기
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
