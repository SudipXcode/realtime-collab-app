import AutoCarousel from '@/components/homepage/AutoCarousel'
import LoginInfo from '@/components/homepage/LoginInfo'
import FirebaseOAuth from '@/components/homepage/OAuth'
import React from 'react'

export default function Page(): React.JSX.Element {
  return (
    <div className='w-full h-screen'>
      <main className='w-full flex justify-between h-full'>
        <AutoCarousel />
        <div className="flex-1 h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#1C1C1C] via-[#2D2D2D] to-[#242424]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35))]" />
          <div className="relative z-10 h-full flex flex-col gap-8 items-center justify-center">
            <LoginInfo />
            <FirebaseOAuth />
          </div>
        </div>
      </main>
    </div>
  )
}
