'use client'

import React from 'react'
import CtaButton from '@/components/CtaButton'
import {
  ShieldIcon,
  TargetIcon,
  DiamondIcon,
  WandIcon,
} from '@/components/icons'

const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) => (
  <div className="relative group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative">
      <div className="inline-block p-3 mb-4 bg-purple-100 text-purple-600 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  </div>
)

export default function AboutPage() {
  return (
    <main className="text-gray-800">
      {/* Hero Section */}
      <div className="relative pt-20 pb-20 text-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#d5c5ff,transparent)]"></div>
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-normal bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent break-words">
            Dynamic Digital Watermarking
          </h1>

          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-600">
            당신의 소중한 영상 콘텐츠를 보호하세요. 육안으로 식별 불가능한
            워터마크로 유출자를 정확히 추적하고, 콘텐츠의 가치를 지킵니다.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <CtaButton
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 transform hover:shadow-purple-500/50"
              authText="지금 영상 업로드"
              guestText="무료로 시작하기"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              왜 DDW를 사용해야 할까요?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              단순한 워터마크를 넘어, 콘텐츠 보안을 위한 완벽한 솔루션을
              제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<ShieldIcon />} title="강력한 암호화 보안">
              모든 워터마크 정보는 서버의 비밀 키로 암호화됩니다. 데이터가
              유출되어도 저희 서버가 아니면 절대 해독할 수 없습니다.
            </FeatureCard>
            <FeatureCard icon={<TargetIcon />} title="정확한 유출자 추적">
              영상마다 고유한 사용자 정보가 삽입되어, 유출 발생 시 어떤 사용자의
              영상인지 100% 정확하게 식별할 수 있습니다.
            </FeatureCard>
            <FeatureCard icon={<DiamondIcon />} title="원본 화질 보존">
              무손실 압축 코덱(Lossless Codec)을 사용하여 워터마크를 삽입하므로,
              원본 영상의 화질 저하가 전혀 없습니다.
            </FeatureCard>
            <FeatureCard icon={<WandIcon />} title="간편한 사용법">
              복잡한 과정 없이 영상을 업로드하기만 하면, 모든 워터마킹 과정이
              자동으로 처리되는 직관적인 시스템을 제공합니다.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              어떻게 작동하나요?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              단 3단계로 당신의 콘텐츠를 안전하게 보호하세요.
            </p>
          </div>
          <div className="relative">
            <div
              className="absolute left-1/2 top-12 bottom-12 w-px bg-gray-200 hidden lg:block"
              aria-hidden="true"
            ></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 text-purple-600 rounded-full text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">영상 업로드</h3>
                <p className="text-gray-600">
                  보호하고 싶은 원본 영상을 업로드합니다. 회원가입 후 누구나
                  쉽게 이용할 수 있습니다.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 text-purple-600 rounded-full text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">자동 워터마킹</h3>
                <p className="text-gray-600">
                  시스템이 자동으로 당신의 고유 정보를 암호화하여 비가시성
                  워터마크로 영상에 삽입합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 text-purple-600 rounded-full text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">유출자 추적</h3>
                <p className="text-gray-600">
                  외부에 유출된 영상을 발견하면, &apos;유출자 추적&apos;
                  페이지에 업로드하여 누가 유출했는지 즉시 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            지금 바로 당신의 콘텐츠를 보호하세요
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            더 이상 콘텐츠 불법 유출로 고민하지 마세요. DDW가 가장 확실한
            해결책을 제공합니다.
          </p>
          <div className="mt-8">
            <CtaButton
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-10 py-4 text-lg font-medium text-white shadow-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 transform hover:shadow-purple-500/50"
              authText="내 영상 보호하기"
              guestText="무료로 시작하기"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
