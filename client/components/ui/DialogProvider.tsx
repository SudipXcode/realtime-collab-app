"use client"

import ProfileDialog from "../profile/ProfileDialog"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/redux/store"
import { closeProfile } from "@/redux/slices/profileSlice"
import UpgradePremiumDialog from "../profile/UpgradePremiumDialog"
import { closePay } from "@/redux/slices/paySlice"

export default function DialogProvider(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>()

    const isProfileOpen = useSelector<RootState, boolean>(
        (state) => state.profile.isProfileOpen
    )

    const isPayOpen = useSelector<RootState, boolean>(
        (state) => state.pay.isPayOpen
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

            {isPayOpen && <UpgradePremiumDialog
                open={isPayOpen}
                onOpenChange={(open: boolean) =>
                    !open && dispatch(closePay())
                }
            />}
        </>
    )
}