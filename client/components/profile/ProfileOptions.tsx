// import { openPay } from '@/redux/slices/paySlice'
import { Bell, CircleQuestionMark, Clock, Crown, DollarSign, Ellipsis, Keyboard, LayoutDashboard, Puzzle, UserCircle, Users, View } from 'lucide-react'
import React from 'react'
import { useDispatch } from 'react-redux'

const ProfileOptions = ({ onOpenChange }) => {
    // const dispatch = useDispatch()
    return (
        <div className='flex-none p-4 border-r border-[#2D2D2D]  h-full w-55'>
            <h5 className='text-[15px] font-semibold'>Settings</h5>
            <div className='w-full h-auto mt-4 flex flex-col gap-1'>
                <button title='Account' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <UserCircle size={17} strokeWidth={2} />
                    Account
                </button>
                <button onClick={() => {
                    // dispatch(openPay())
                    onOpenChange(false)
                }
                } title='Premium' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Crown size={17} strokeWidth={2} />
                    Premium
                </button>
                <button title='Subscription' className='w-full px-2 mt-4 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <DollarSign size={17} strokeWidth={2} />
                    Subscriptions
                </button>
                <button title='Features' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <LayoutDashboard size={17} strokeWidth={2} />
                    Features
                </button>
                <button title='Notifications' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Bell size={17} strokeWidth={2} />
                    Notifications
                </button>
                <button title='Date & Time' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Clock size={17} strokeWidth={2} />
                    Date & Time
                </button>
                <button title='Appearance' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <View size={17} strokeWidth={2} />
                    Appearance
                </button>
                <button title='More' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Ellipsis size={17} strokeWidth={2} />
                    More
                </button>
                <button title='Integrations & Import' className='w-full mt-4 px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Puzzle size={17} strokeWidth={2} />
                    Integrations & Import
                </button>
                <button title='Collaborate' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Users size={17} strokeWidth={2} />
                    Collaborate
                </button>
                <button title='Shortcuts' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <Keyboard size={17} strokeWidth={2} />
                    Shortcuts
                </button>
                <button title='About' className='w-full mt-4 px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                    <CircleQuestionMark size={17} strokeWidth={2} />
                    About
                </button>
            </div>
        </div>
    )
}

export default ProfileOptions
