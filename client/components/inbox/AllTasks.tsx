"use client";

import React, { useEffect } from "react";
import {
    DndContext,
    closestCenter,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import Task from "../lists/view/Task";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";

import { setTasks } from "@/redux/slices/TaskDetails";
import { BookCheck } from "lucide-react";

const AllTasks = ({ list }) => {
    const dispatch = useDispatch();

    const { tasks, loading } = useSelector(
        (state: RootState) => state.task
    );

    /* ✅ Filter tasks for current list */
    const filteredTasks = React.useMemo(() => {
        return tasks.filter((t) => t.listId === list?.id);
    }, [tasks, list?.id]);

    /* ✅ 1. SSR → Redux */
    useEffect(() => {
        if (list?.tasks?.length) {
            dispatch(setTasks(list.tasks));
        }
    }, [dispatch, list?.tasks]);

    /* ✅ 3. DRAG HANDLER (Redux-based) */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = filteredTasks.findIndex(
            (item) => String(item.id) === String(active.id)
        );

        const newIndex = filteredTasks.findIndex(
            (item) => String(item.id) === String(over.id)
        );

        const reordered = arrayMove(filteredTasks, oldIndex, newIndex);

        // keep other list tasks intact
        const otherTasks = tasks.filter(
            (t) => t.listId !== list.id
        );

        // merge back
        dispatch(setTasks([...otherTasks, ...reordered]));
    };

    const [openTaskOptions, setOpenTaskOptions] = React.useState(null);



    /* ✅ Loading UI */
    function Shimmer({ className }: { className?: string }) {
        return (
            <div
                className={`relative overflow-hidden rounded bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`}
            />
        );
    }

    if (loading) {
        return (
            <div className="px-8 h-full pt-6">
                {[140, 180, 120, 160, 200].map((w, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-2 border-b border-white/5"
                    >
                        <Shimmer className="h-4 w-4 rounded shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                            <Shimmer className="h-3 rounded" style={{ width: w }} />
                            <Shimmer
                                className="h-2.5 rounded opacity-60"
                                style={{ width: w + 60 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (filteredTasks.length === 0) {
        return (
            <div className="px-10 pt-6 flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center bg-[#2F2F2F] rounded-lg rotate-45">
                    <BookCheck className="text-[#7C7C7C]" size={20} />
                </div>
                <h5 className="text-[14px] text-[#7C7C7C] font-medium">
                    You don’t have any inbox task !
                </h5>
            </div>
        );
    }

    return (
        <div className="w-full pt-4 overflow-y-scroll scrollbar h-full">
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={filteredTasks.map((i) => String(i.id))} // ✅ FIXED
                    strategy={verticalListSortingStrategy}
                >
                    <div className="w-full h-auto pl-8 pr-1 flex flex-col">
                        {filteredTasks.map((i) => ( // ✅ FIXED
                            <Task
                                key={i.id}
                                i={i}
                                list={list}
                                setOpenTaskOptions={setOpenTaskOptions}
                                openTaskOptions={openTaskOptions}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default AllTasks;