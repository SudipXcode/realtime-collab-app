"use client";

import React, { useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import Task from "./Task";
import Lists from "./Lists";
import { FolderSearch } from "lucide-react";

/* ================= TYPES ================= */

interface TaskType {
    id: string;
    type: "task";
    title: string;
    desc: string | null;
    listName: string;
    isChecked: boolean;
}

interface ListType {
    id: string;
    type: "list";
    title: string;
    desc: string | null;
    membersCount: number;
}

type ItemType = TaskType | ListType;

interface Props {
    data: ItemType[] | null;
    loading: boolean;
    error: string | null;
    query: string;
}

/* ================= COMPONENT ================= */

const AllTasks = ({ data, query }: Props) => {
    const [items, setItems] = useState<ItemType[] | null>(null);

    const getId = (item: ItemType) => `${item.type}-${item.id}`;
    const displayItems = items ?? data ?? [];

    /* ================= DRAG ================= */

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setItems((prev) => {
            const current = prev ?? data ?? [];

            const oldIndex = current.findIndex(
                (i) => getId(i) === active.id
            );

            const newIndex = current.findIndex(
                (i) => getId(i) === over.id
            );

            if (oldIndex === -1 || newIndex === -1) return current;

            return arrayMove(current, oldIndex, newIndex);
        });
    }

    /* ================= EMPTY ================= */

    if (!displayItems.length) {
        return (
            <div className="px-10 pt-6 flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center bg-[#2F2F2F] rounded-lg rotate-45">
                    <FolderSearch className="text-[#7C7C7C]" size={20} />
                </div>
                <h5 className="text-[14px] text-[#7C7C7C] font-medium">
                    You don’t have any search result yet!
                </h5>
            </div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="w-full h-auto">
            <div className="pt-4 px-6 w-full h-full flex flex-col gap-0.5">
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={displayItems.map(getId)} // ✅ FIXED
                        strategy={verticalListSortingStrategy}
                    >
                        {displayItems.map((item) => {
                            const uniqueId = getId(item);

                            if (!item.id) return null; // safety

                            if (item.type === "task") {
                                return (
                                    <Task
                                        key={uniqueId}
                                        id={uniqueId} // ✅ MUST match DnD
                                        i={item}
                                        query={query}
                                    />
                                );
                            }

                            return (
                                <Lists
                                    key={uniqueId}
                                    id={uniqueId} // ✅ MUST match DnD
                                    list={item}
                                    query={query}
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default AllTasks;