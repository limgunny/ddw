'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

const TokenExpiryWarning: React.FC = () => {
  const { tokenExpiryWarning, dismissTokenWarning, refreshAccessToken } =
    useAuth()

  const handleRefresh = async () => {
    const success = await refreshAccessToken()
    if (success) {
      dismissTokenWarning()
    }
  }

  if (!tokenExpiryWarning) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              세션이 곧 만료됩니다
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                보안을 위해 세션이 곧 만료됩니다. 계속 사용하려면 갱신해주세요.
              </p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 transition-colors"
              >
                세션 갱신
              </button>
              <button
                onClick={dismissTokenWarning}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={dismissTokenWarning}
              className="bg-yellow-50 rounded-md p-1.5 text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <span className="sr-only">닫기</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenExpiryWarning



