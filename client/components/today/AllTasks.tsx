

"use client";

import React, { useEffect, useRef } from "react";
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
import Task from "./Task";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setTasks } from "@/redux/slices/TaskDetails";
import { BookCheck } from "lucide-react";

const AllTasks = ({ tasks: initialTasks }) => {
    const dispatch = useDispatch();
    console.log(initialTasks)
    // Use Redux tasks for rendering
    const tasks = useSelector(
        (state: RootState) => state.task.tasks
    );

    // hydrate only once
    // const hydrated = useRef(false);

    // useEffect(() => {
    //     if (!hydrated.current && initialTasks?.length) {
    //         dispatch(setTasks(initialTasks));
    //         hydrated.current = true;
    //     }
    // }, [dispatch, initialTasks]);
    useEffect(() => {
        dispatch(setTasks(initialTasks || []));
    }, [dispatch, initialTasks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex(
            (item) => String(item.id) === String(active.id)
        );

        const newIndex = tasks.findIndex(
            (item) => String(item.id) === String(over.id)
        );

        const reordered = arrayMove(tasks, oldIndex, newIndex);

        dispatch(setTasks(reordered));
    };

    const [openTaskOptions, setOpenTaskOptions] =
        React.useState(null);


    if (tasks.length === 0) {
        return (
            <div className="px-10 pt-6 flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center bg-[#2F2F2F] rounded-lg rotate-45">
                    <BookCheck
                        className="text-[#7C7C7C]"
                        size={20}
                    />
                </div>
                <h5 className="text-[14px] text-[#7C7C7C] font-medium">
                    You don’t have any task today!
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
                    items={tasks.map((i) => String(i.id))}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="w-full h-auto pl-8 pr-1 flex flex-col">
                        {tasks.map((i) => (
                            <Task
                                key={i.id}
                                i={i}
                                setOpenTaskOptions={
                                    setOpenTaskOptions
                                }
                                openTaskOptions={
                                    openTaskOptions
                                }
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default AllTasks;