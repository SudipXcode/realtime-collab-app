
"use client"

import { formatDate } from "@/lib/DateFormatting"
import {
    Check,
    EllipsisVertical,
    GripVertical,
    Star,
    X,
} from "lucide-react"
import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useOutsideClick } from "@/hooks/useOutSideclick"
import ListOptions from "./ListOptions"
import Link from "next/link"

// =============================
// ✅ TYPE
// =============================
interface ListItem {
    id: string
    title: string
    date: string
    isactive: boolean
    isFavourite: boolean

    createby: string

    isOwner: boolean
    isShared: boolean
    isPending: boolean

    members: {
        id: string
        name: string
        email: string
    }[]

    pendingUsers?: string[]
}

interface Props {
    i: ListItem
    selectedLists: string[]
    setSelectedLists: React.Dispatch<React.SetStateAction<string[]>>

    openListOptions: string | null
    setOpenListOptions: (id: string | null) => void
    noNavigate?: boolean
    handleDeleteList: (id: string) => void
    handleFunctionFavourite: (id: string) => void
    handleFunctionApprove?: (id: string, state: boolean) => void
}

const List: React.FC<Props> = ({
    selectedLists,
    setSelectedLists,
    i,
    openListOptions,
    setOpenListOptions,
    handleDeleteList,
    handleFunctionFavourite,
    handleFunctionApprove,
    noNavigate
}) => {
    // =============================
    // ✅ DRAG
    // =============================
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: i.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    }

    // =============================
    // ✅ OUTSIDE CLICK
    // =============================
    const ListOptionRef = React.useRef<HTMLDivElement | null>(null)

    useOutsideClick(
        ListOptionRef,
        () => setOpenListOptions(null),
        openListOptions === i.id
    )

    // =============================
    // ✅ CONTENT (reused)
    // =============================
    const content = (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        ${selectedLists?.includes(i.id)
                    ? "bg-[#2F2F2F]"
                    : "hover:bg-[#232323]"
                }
        ${openListOptions === i.id && "bg-[#232323]"}
        w-full transition ease-in duration-150 group relative h-auto px-2 rounded-xl
      `}
        >
            {/* DRAG HANDLE */}
            <button
                title="Sort"
                {...attributes}
                {...listeners}
                className="absolute text-[#a7a7a7] opacity-0 group-hover:opacity-100 transition w-auto h-full rounded-xl cursor-grab -left-4"
            >
                <GripVertical size={15} />
            </button>

            <div className="w-full py-2 px-1  flex items-center border-b border-[#2D2D2D] ">
                {/* SELECT */}
                <div className="w-auto h-auto p-2 ">
                    <div
                        title="Select"
                        onClick={(e) => {
                            e.preventDefault()
                            setSelectedLists((prev) =>
                                prev.includes(i.id)
                                    ? prev.filter((item) => item !== i.id)
                                    : [...prev, i.id]
                            )
                        }
                        }
                        className={`
            ${selectedLists?.includes(i.id)
                                ? "border-[#4772FA] bg-[#4772FA]"
                                : "border-[#727272]"
                            }
            flex-none cursor-pointer w-4.5 h-4.5 rounded-md border-2
          `}
                    >
                        {selectedLists?.includes(i.id) && <Check size={14} />}
                    </div>
                </div>
                {/* CONTENT */}
                <div className="w-full flex flex-col gap-1 pl-1">
                    {/* TITLE */}
                    <div className="flex items-center gap-3">
                        <h5 className="text-[14px] font-medium">{i.title}</h5>

                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                handleFunctionFavourite(i.id)
                            }}
                            title="Favourite"
                            className={`
                ${i.isFavourite
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                }
                text-[#a7a7a7] transition
              `}
                        >
                            {i.isFavourite ? (
                                <Star size={14} fill="#a7a7a7" />
                            ) : (
                                <Star size={14} />
                            )}
                        </button>
                    </div>

                    {/* META */}
                    <div className="flex pl-1 items-center gap-3 flex-wrap">
                        <p className="text-[#7C7C7C] text-[12px]">
                            {i.isactive ? "Active list" : "Deactivated"}
                        </p>

                        <p className="text-[10px] text-[#7C7C7C]">|</p>

                        <p className="text-[#7C7C7C] text-[12px]">
                            Created by {i.createby} • {formatDate(i.date)}
                        </p>

                        {/* SHARED */}
                        {i.isShared && (
                            <p className="text-[#4772FA] text-[12px]">
                                Shared list with {i.members.map(m => m.name).join(", ")}
                            </p>
                        )}

                        {/* PENDING */}
                        {i.members.length > 0 && !i.isShared && (
                            <>
                                {!i.isOwner && (
                                    <div className="flex items-center gap-3">
                                        <p className="text-[#4772FA] text-[12px]">
                                            Accept collaboration request?
                                        </p>

                                        <div className="flex gap-3 items-center">
                                            <button
                                                onClick={() =>
                                                    handleFunctionApprove?.(i.id, true)
                                                }
                                                className="text-[#a7a7a7] hover:text-[#2A9D99]"
                                            >
                                                <Check size={15} strokeWidth={2.5} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleFunctionApprove?.(i.id, false)
                                                }
                                                className="text-[#a7a7a7] hover:text-red-500"
                                            >
                                                <X size={15} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {i.isOwner && (
                                    <p className="text-[#4772FA] text-[12px]">
                                        Waiting response from {i?.members[0]?.name}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* OPTIONS */}
                <div className="flex-none flex items-center gap-4">
                    <div
                        className="relative flex items-center"
                        ref={ListOptionRef}
                    >
                        <button
                            title="More options"
                            onClick={(e) => {
                                e.preventDefault()
                                setOpenListOptions(
                                    openListOptions === i.id ? null : i.id
                                )
                            }
                            }
                            className="text-[#727272] hover:text-white p-1  transition"
                        >
                            <EllipsisVertical size={15} strokeWidth={2.5} />
                        </button>

                        {openListOptions === i.id && (
                            <ListOptions
                                handleFunctionFavourite={handleFunctionFavourite}
                                handleDeleteList={handleDeleteList}
                                i={i}
                                close={() => setOpenListOptions(null)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    // =============================
    // ✅ CONDITIONAL NAVIGATION
    // =============================
    if (noNavigate) return content

    return (
        <Link href={`/inbox/${i.id}`}>
            {content}
        </Link>
    )
}

export default List