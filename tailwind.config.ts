import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // 참고: theme 객체에 extend 키가 두 번 정의되어 있었습니다.
    // 마지막에 정의된 `extend: {}`가 이전에 정의된 설정을 덮어쓰므로,
    // 의도치 않은 동작이 발생할 수 있습니다. 불필요한 extend를 제거했습니다.
    extend: {
      fontFamily: {
        // 기본 고딕 폰트(Inter)를 사용하도록 설정합니다.
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // SplashScreen 애니메이션을 정의합니다.
        fadeOut: 'fadeOut 1s ease-in-out 3s forwards',
        fadeInDown: 'fadeInDown 1s ease-out 0.5s forwards',
      },
    },
  },
  plugins: [],
}
export default config
