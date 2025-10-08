// API 설정 유틸리티
export const API_BASE_URL = (() => {
  // 배포 환경에서는 환경변수 사용
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // 로컬 개발 환경에서는 배포된 서버 사용
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    return 'https://ddw-backend.onrender.com'
  }

  // 기본값 (배포 환경)
  return 'https://ddw-backend.onrender.com'
})()

// API 호출 최적화를 위한 유틸리티 함수들
export const apiUtils = {
  // 기본 헤더 설정
  getHeaders: (token?: string) => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }),

  // 에러 처리
  handleError: (error: any) => {
    console.error('API Error:', error)
    return {
      error: error.message || '서버와 통신 중 오류가 발생했습니다.',
    }
  },

  // 타임아웃 설정
  fetchWithTimeout: async (
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  },

  // 토큰 자동 갱신이 포함된 API 호출
  fetchWithAuth: async (
    url: string,
    options: RequestInit = {},
    token: string | null,
    refreshToken: string | null,
    refreshAccessToken: () => Promise<boolean>,
    timeout = 10000
  ) => {
    let currentToken = token

    // 토큰이 만료되었는지 확인하고 갱신
    if (currentToken && refreshToken) {
      try {
        const decoded = JSON.parse(atob(currentToken.split('.')[1]))
        const currentTime = Date.now() / 1000

        // 만료 5분 전에 갱신
        if (decoded.exp - currentTime < 300) {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            currentToken = localStorage.getItem('token')
          }
        }
      } catch (error) {
        console.error('Token validation failed:', error)
      }
    }

    // API 호출
    const response = await apiUtils.fetchWithTimeout(
      url,
      {
        ...options,
        headers: {
          ...options.headers,
          ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        },
      },
      timeout
    )

    // 401 에러인 경우 토큰 갱신 시도
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        const newToken = localStorage.getItem('token')
        // 갱신된 토큰으로 재시도
        return apiUtils.fetchWithTimeout(
          url,
          {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          },
          timeout
        )
      }
    }

    return response
  },
}

export const apiEndpoints = {
  videos: `${API_BASE_URL}/api/videos`,
  embed: `${API_BASE_URL}/api/embed`,
  embedStatus: (taskId: string) => `${API_BASE_URL}/api/embed/status/${taskId}`,
  extract: `${API_BASE_URL}/api/extract`,
  login: `${API_BASE_URL}/api/login`,
  signup: `${API_BASE_URL}/api/signup`,
  refresh: `${API_BASE_URL}/api/refresh`,
  myVideos: `${API_BASE_URL}/api/my-videos`,
  health: `${API_BASE_URL}/api/health`,
  admin: {
    allVideos: `${API_BASE_URL}/api/admin/all-videos`,
    allUsers: `${API_BASE_URL}/api/admin/all-users`,
    deleteVideo: (id: number) => `${API_BASE_URL}/api/admin/videos/${id}`,
    deleteUser: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
  },
  profile: {
    changePassword: `${API_BASE_URL}/api/profile/change-password`,
    deleteAccount: `${API_BASE_URL}/api/profile/delete-account`,
  },
  video: {
    view: (id: number) => `${API_BASE_URL}/api/videos/${id}/view`,
    delete: (id: number) => `${API_BASE_URL}/api/videos/${id}`,
  },
  outputs: (filename: string) => `${API_BASE_URL}/outputs/${filename}`,
}
