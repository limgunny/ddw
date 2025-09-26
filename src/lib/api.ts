// API 설정 유틸리티
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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



