'use client'

import { useEffect, useState } from 'react'
import DDWLogo from './DDWLogo'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 세션 중에 스플래시가 표시되었는지 확인합니다.
    if (sessionStorage.getItem('splashShown')) {
      setIsVisible(false)
      return
    }

    // 이 세션에 대해 표시됨으로 표시하고, 스플래시를 보이게 합니다.
    sessionStorage.setItem('splashShown', 'true')
    setIsVisible(true)

    // 3초 후 스플래시 스크린을 숨깁니다.
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-fadeOut pointer-events-none">
      {/* 밝고 몽환적인 느낌을 주기 위해 그라데이션과 블러 효과를 강화합니다. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.5),transparent_70%)] blur-3xl"></div>
      {/* 로고에 네온사인 같은 빛나는 효과를 추가합니다. */}
      <DDWLogo className="w-48 md:w-64 h-auto opacity-0 animate-fadeInDown drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]" />
    </div>
  )
}
