"use client"

import ProfileDialog from "../profile/ProfileDialog"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/redux/store"
import { closeProfile } from "@/redux/slices/profileSlice"
import UpgradePremiumDialog from "../profile/UpgradePremiumDialog"
import { closePay } from "@/redux/slices/paySlice"
import ListCreateDialog from "../lists/ListCreateDialog"
import { closeList } from "@/redux/slices/ListSlice"
import { closeCollab } from "@/redux/slices/CollabSlice"
import { closeShare } from "@/redux/slices/ShareSlice"
import ShareDialog from "./ShareDialog"
import CollabDialog from "./CollabDialog"

export default function DialogProvider(): React.JSX.Element {
    const dispatch = useDispatch<AppDispatch>()

    const isProfileOpen = useSelector<RootState, boolean>(
        (state) => state.profile.isProfileOpen
    )

    const isPayOpen = useSelector<RootState, boolean>(
        (state) => state.pay.isPayOpen
    )
    const isListOpen = useSelector<RootState, boolean>(
        (state) => state.list.isListOpen
    )
    const isShareOpen = useSelector<RootState, boolean>(
        (state) => state.share.isShareOpen
    )
    const isCollabOpen = useSelector<RootState, boolean>(
        (state) => state.collab.isCollabOpen
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
            {isListOpen && <ListCreateDialog
                open={isListOpen}
                onOpenChange={(open: boolean) =>
                    !open && dispatch(closeList())
                }
            />}

            {isShareOpen && <ShareDialog
                open={isShareOpen}
                onOpenChange={(open: boolean) =>
                    !open && dispatch(closeShare())
                }
            />}
            {isCollabOpen && <CollabDialog
                open={isCollabOpen}
                onOpenChange={(open: boolean) =>
                    !open && dispatch(closeCollab())
                }
            />}
        </>
    )
}