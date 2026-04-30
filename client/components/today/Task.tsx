"use client";

import { useOutsideClick } from "@/hooks/useOutSideclick";
import { Check, EllipsisVertical, GripVertical } from "lucide-react";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MoreOptions from "../lists/MoreOptions";
import { formatDate } from "@/lib/DateFormatting";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTask } from "@/redux/slices/TaskDetails";
import {
    deleteTaskThunk,
    moveTaskThunk,
    updateTaskDebouncedThunk,
} from "@/redux/thunk/taskThunk";
import { showToast } from "@/lib/toast";

const Task = ({ i, openTaskOptions, setOpenTaskOptions }) => {
    const dispatch = useDispatch();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: String(i.id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const [taskOpen, setTaskOpen] = React.useState(false);
    const moreOptionRef = React.useRef(null);

    useOutsideClick(
        moreOptionRef,
        () => setOpenTaskOptions(null),
        openTaskOptions && !taskOpen
    );

    const selectedTask = useSelector((state) => state.task.selectedTask);

    /* ✅ ALWAYS GET LATEST TASK (avoid stale data) */
    const latestTask = useSelector((state) =>
        state.task.tasks.find((t) => t.id === i.id)
    );


    /* ================= DELETE ================= */
    const handleDelete = async () => {
        const res = await dispatch(
            deleteTaskThunk({
                taskId: i?.id,
                listId: i?.listId,
            })
        );

        if (deleteTaskThunk.fulfilled.match(res)) {
            showToast("Task deleted!", "success");
        } else {
            const errorMsg =
                res.payload?.message ||
                "You don't have delete permission as guest!";
            showToast(errorMsg, "warning");
        }
    };

    /* ================= CHECK ================= */
    const [isChecking, setIsChecking] = React.useState(false);

    const handleCheck = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!latestTask) return;

        setIsChecking(true);

        dispatch(
            updateTaskDebouncedThunk({
                id: i.id,
                isChecked: !latestTask.isChecked,
            })
        );

        showToast(
            !latestTask.isChecked ? "Task completed" : "Task reopened",
            "success"
        );

        setTimeout(() => setIsChecking(false), 700);
    };

    /* ================= PRIORITY ================= */
    const updatePriority = (priority: string) => {
        dispatch(
            updateTaskDebouncedThunk({
                id: i.id,
                priority,
            })
        );
    };

    /* ================= MOVE LIST ================= */
    const updateList = async (newListId: string) => {
        const result = await dispatch(
            moveTaskThunk({ taskId: i.id, newListId })
        );

        if (moveTaskThunk.fulfilled.match(result)) {
            dispatch(setSelectedTask())
            showToast("Task Moved",
                "success"
            );

        }
    };

    /* ================= HELPERS ================= */
    const isOverdue = (date?: string) => {
        if (!date) return false;

        const today = new Date();
        const taskDate = new Date(date);

        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        return taskDate < today;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            key={i.id}

            className={`${selectedTask?.id === i.id
                ? "bg-[#2D2D2D]"
                : "hover:bg-[#232323]"
                } w-full transition ease-in duration-150 group relative h-auto px-2 rounded-xl cursor-pointer`}
        >
            {/* DRAG */}
            <button
                title="Sort"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="absolute text-[#a7a7a7] outline-none opacity-0 group-hover:opacity-100 transition w-auto h-full rounded-xl cursor-grab -left-4"
            >
                <GripVertical size={15} />
            </button>

            <div className="flex items-center gap-2 w-full border-b h-11.5 border-[#2D2D2D]">
                {/* CHECKBOX */}
                <div
                    onClick={handleCheck}
                    title="Check box"
                    className={`${latestTask?.isChecked
                        ? "border-[#4772FA] bg-[#4772FA]"
                        : "border-[#727272]"
                        } flex-none cursor-pointer w-4.5 h-4.5 rounded-md border-2 relative`}
                >
                    {isChecking ? (
                        <span className="absolute inset-0 rounded-sm border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                        latestTask?.isChecked && <Check size={14} />
                    )}
                </div>

                {/* TITLE + DATE */}
                <div
                    onClick={() => dispatch(setSelectedTask(i))}
                    className="w-full h-full flex items-center justify-between pl-1"
                >
                    <h5
                        className={`text-[14px] font-medium
              ${latestTask?.isChecked
                                ? "line-through text-[#7C7C7C]"
                                : ""
                            }
              ${!latestTask?.isChecked &&
                                isOverdue(latestTask?.dueDate)
                                ? "line-through decoration-red-500 text-red-400"
                                : ""
                            }`}
                    >
                        {latestTask?.title}
                    </h5>

                    <div className="flex items-center gap-4">
                        <p className="text-[#7C7C7C] text-[12px] flex items-center gap-2 font-medium">
                            {formatDate(latestTask?.dueDate)}
                        </p>
                        <p className="text-[#dbd9d9] text-[12px] flex items-center gap-2 font-medium">{i?.listName}</p>
                    </div>
                </div>

                {/* MORE OPTIONS */}
                <div className="relative flex items-center">
                    <button
                        title="More options"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenTaskOptions(i.id);
                        }}
                        className="text-[#727272] hover:text-white transition"
                    >
                        <EllipsisVertical size={15} strokeWidth={2.5} />
                    </button>

                    {openTaskOptions === i.id && (
                        <MoreOptions
                            ref={moreOptionRef}

                            position="top-0"
                            deleteoption={true}
                            close={() => setOpenTaskOptions(null)}
                            handleDelete={handleDelete}
                            taskOpen={taskOpen}
                            setTaskOpen={setTaskOpen}
                            priority={latestTask?.priority}
                            setPriority={(p) => {
                                updatePriority(p);
                            }}
                            setList={(l) => {
                                updateList(l);
                            }}

                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Task;