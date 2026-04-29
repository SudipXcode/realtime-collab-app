"use client"
import { GripVertical } from "lucide-react"
import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"

const Lists = ({ query, list, id }) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    function highlight(title?: string, query?: string) {
        if (!title) return ""; // ✅ prevent undefined crash
        if (!query) return title; // ✅ FIX (was "text")

        const parts = title.split(new RegExp(`(${query})`, "gi"));

        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={index} className="bg-[#c68b168f] text-gray-200 px-0.5">
                    {part}
                </span>
            ) : (
                part
            )
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={` hover:bg-[#232323] cursor-pointer  w-full transition ease-in duration-150 group relative  h-auto px-2 rounded-xl`}
        >
            <button
                title='Sort'
                {...attributes}
                {...listeners}
                className='absolute text-[#a7a7a7] outline-none opacity-0 group-hover:opacity-100 transition ease-linear duration-200 w-auto h-full rounded-xl cursor-grab -left-4'>
                <GripVertical size={15} />
            </button>
            <Link href={`/inbox/${list?.id}`}>
                <div className=' gap-2 w-full  h-auto flex items-center justify-between pl-1 border-b py-2  border-[#2D2D2D]'>
                    <h5 className={` text-[14px] font-medium`}>{highlight(list?.title, query)}</h5>
                    {list?.members.length > 0 && <p className='text-[#7C7C7C] line-clamp-1 text-[12px] font-medium'>Working with {list?.members[0].name}</p>}
                </div>
            </Link>
        </div>
    )
}

export default Lists
