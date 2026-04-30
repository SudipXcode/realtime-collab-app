
"use client"

import React from "react"
import { formatDate } from "@/lib/DateFormatting"
import Task from "./Task"
import Link from "next/link"
const List = ({ query, i }) => {

    function highlight(text?: string, query?: string) {
        if (!text) return ""
        if (!query) return text

        const parts = text.split(new RegExp(`(${query})`, "gi"))

        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span
                    key={index}
                    className="bg-[#c68b168f] text-gray-200 px-0.5 inline"
                >
                    {part}
                </span>
            ) : (
                <span key={index} className="inline">
                    {part}
                </span>
            )
        )
    }


    function limitWords(text: string, limit = 20) {
        if (!text) return ""

        const words = text.split(" ")

        if (words.length <= limit) return text

        return words.slice(0, limit).join(" ") + "..."
    }
    return (
        <div className=" w-full h-auto  flex flex-col gap-1 p-1 " >
            <Link href={`/inbox/${i?.id}`}>
                <div className="w-full bg-[#232323] rounded-xl h-auto flex gap-4 p-2  items-center">
                    <div className="w-full h-auto ">
                        <h5 className="text-[14px] font-medium"> {highlight(limitWords(i?.name, 25), query)}</h5>
                    </div>
                    <div className="flex flex-none pl-1 items-center gap-3 flex-wrap">
                        <p className="text-[#7C7C7C] text-[12px]">
                            {i.isActive ? "Active list" : "Deactivated"}
                        </p>

                        <p className="text-[10px] text-[#7C7C7C]">|</p>

                        <p className="text-[#7C7C7C] text-[12px]">
                            Created by {i.createby} • {formatDate(i.createdAt)}
                        </p>
                    </div>
                </div>
            </Link>
            <div className="w-full h-auto pl-4 flex flex-col gap-0.5">
                {i?.tasks.map((task) => (
                    <Task key={task.id} query={query} task={task} listId={i?.id} />
                ))}
            </div>
        </div>
    )
}

export default List
