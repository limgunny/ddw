'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function CtaButton({
  className,
  authText,
  guestText,
}: {
  className: string
  authText: string
  guestText: string
}) {
  const { isAuthenticated } = useAuth()
  return (
    <Link
      href={isAuthenticated ? '/watermark/insert' : '/signup'}
      className={className}
    >
      {isAuthenticated ? authText : guestText}
    </Link>
  )
}
