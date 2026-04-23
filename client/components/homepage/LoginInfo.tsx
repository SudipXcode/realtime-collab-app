import Image from 'next/image'
import React, { FC } from 'react'
import Logo from '@/public/custom-agent-facepile.png'

const LoginInfo: FC = () => {
    return (
        <div className='w-70 h-auto flex flex-col gap-4 items-center justify-center'>
            <Image className='w-36 h-auto' alt='logo' src={Logo} />
            <h2 className='text-center text-[36px] mt-10 leading-12  font-bold'>
                One workspace. Zero busywork.
            </h2>
            <p className='text-center text-[#c8c8d3] font-medium text-[14px]'>
                Sign in to get things done - your tasks, notes and meetings all in one place
            </p>
        </div>
    )
}

export default LoginInfo