import React from 'react'

export default function DDWLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DDW Logo"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <g>
        <text
          x="5"
          y="85"
          fontFamily="var(--font-inter), sans-serif"
          fontSize="100"
          fontWeight="900"
          fill="url(#logo-gradient)"
        >
          D
        </text>
        <path
          d="M105 15 L105 85 L165 50 Z"
          fill="url(#logo-gradient)"
          transform="translate(5, 0)"
        />
        <text
          x="170"
          y="85"
          fontFamily="var(--font-inter), sans-serif"
          fontSize="100"
          fontWeight="900"
          fill="url(#logo-gradient)"
        >
          W
        </text>
      </g>
    </svg>
  )
}
