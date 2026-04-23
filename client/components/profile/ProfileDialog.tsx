import React from 'react'
import { useOutsideClick } from '@/hooks/useOutSideclick';
import ProfileOptions from './ProfileOptions';
import Profile from './Profile';
const ProfileDialog = ({ open, onOpenChange }) => {
    const closeRef = React.useRef(null)
    useOutsideClick(closeRef, () => onOpenChange(false), open);

    if (!open) return null
    return (
        <div className='w-full h-screen flex  justify-center items-center bg-black/40 fixed top-0 z-50'>
            <div ref={closeRef} className='w-200 relative  flex  justify-between border border-[#2D2D2D]  bg-[#242424] h-170  rounded-2xl'>
                <ProfileOptions onOpenChange={onOpenChange} />
                <Profile onOpenChange={onOpenChange} />
            </div>
        </div>
    )
}

export default ProfileDialog
