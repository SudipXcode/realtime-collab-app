"use client"

import { Crown, LogOut, Settings, View } from 'lucide-react'
import React from 'react'
import { useApi } from "@/hooks/useApi"
import { showToast } from '@/lib/toast'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { openProfile } from '@/redux/slices/profileSlice'

const ProfileOptions = ({ user, setOpenProfileOptions }) => {
  const dispatch = useDispatch()
  const { callApi: logoutApi, loading: logoutLoading } = useApi(
    "/api/auth/logout"
  )

  const handleLogout = async () => {
    const res = await logoutApi({ method: "POST" });

    if (!res) {
      showToast("Logout failed", "error");
    }
    window.location.href = "/";
  };


  return (
    <div className='w-55 fixed flex flex-col top-3 left-12 z-40 rounded-xl py-3 px-2 bg-[#242424] border border-[#2D2D2D]'>

      {/* Profile */}
      <div onClick={() => {
        setOpenProfileOptions(false)
        dispatch(
          openProfile({
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            providers: user.providers,
            isPro: user.isPro,
          })
        );
      }} className='cursor-pointer flex items-center gap-2 pl-2'>
        {user?.image ? (
          <Image
            width={5}
            height={5}
            alt="avatar"
            loading="eager"
            src={user?.image}
            className="w-7.5 h-7.5 flex-none rounded-full object-cover"
          />
        ) : (
          <div className="w-7.5 h-7.5 flex-none rounded-full bg-gray-800" />
        )}
        <div className='w-full  overflow-x-hidden h-auto '>
          <p className='text-[13px] font-medium'>{user?.name}</p>
          <p className='text-[12px]  text-[#7C7C7C]'>{user?.email}</p>
        </div>
      </div>

      {/* Options */}
      <div className='mt-2 flex flex-col'>

        <button onClick={() => {
          setOpenProfileOptions(false)
          // dispatch(openProfile())
        }} className='w-full hover:bg-[#2F2F2F] text-[#e6e6e6] transition-colors px-3 py-2 rounded-xl flex gap-2 items-center text-[13px]'>
          <Crown size={17} />
          Upgrade to premium
        </button>

        <button onClick={() => {
          setOpenProfileOptions(false)
          // dispatch(openProfile())
        }} className='w-full hover:bg-[#2F2F2F] text-[#e6e6e6] transition-colors px-3 py-2 rounded-xl flex gap-2 items-center text-[13px]'>
          <Settings size={17} />
          Account setting
        </button>

        <button onClick={() => {
          setOpenProfileOptions(false)
        }} className='w-full hover:bg-[#2F2F2F] text-[#e6e6e6] transition-colors px-3 py-2 rounded-xl flex gap-2 items-center text-[13px]'>
          <View size={17} />
          Appearance
        </button>

        {/* 🔥 LOGOUT */}
        <button
          onClick={async () => {
            setOpenProfileOptions(false)
            await handleLogout()
          }}
          className='w-full hover:bg-[#2F2F2F] text-[#e6e6e6] transition-colors px-3 py-2 rounded-xl flex gap-2 items-center text-[13px]'
        >
          <LogOut size={17} />
          {logoutLoading ? "Signing out..." : "Sign out"}
        </button>

      </div>
    </div >
  )
}

export default ProfileOptions