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

export const apiEndpoints = {
  videos: `${API_BASE_URL}/api/videos`,
  embed: `${API_BASE_URL}/api/embed`,
  extract: `${API_BASE_URL}/api/extract`,
  login: `${API_BASE_URL}/api/login`,
  signup: `${API_BASE_URL}/api/signup`,
  refresh: `${API_BASE_URL}/api/refresh`,
  myVideos: `${API_BASE_URL}/api/my-videos`,
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
