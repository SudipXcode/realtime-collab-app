"use client"

import ProfileDialog from "../profile/ProfileDialog"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/redux/store"
import { closeProfile } from "@/redux/slices/profileSlice"


export default function DialogProvider(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>()

    const isProfileOpen = useSelector<RootState, boolean>(
        (state) => state.profile.isProfileOpen
    )

    return (
        <>
            {isProfileOpen && (
                <ProfileDialog
                    open={isProfileOpen}
                    onOpenChange={(open: boolean) =>
                        !open && dispatch(closeProfile())
                    }
                />
            )}


        </>
    )
}