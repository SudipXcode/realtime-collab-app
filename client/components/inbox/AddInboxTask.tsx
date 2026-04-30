



"use client";

import { useOutsideClick } from '@/hooks/useOutSideclick';
import { Annoyed, CalendarDays, ChevronDown, Flag } from 'lucide-react';
import React from 'react';
import MoreOptions from '../lists/MoreOptions';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { z } from "zod";

import { showToast } from '@/lib/toast';

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { createInboxTaskThunk } from "@/redux/thunk/taskThunk";

/* ================= PRIORITY STYLES ================= */

const getPriorityStyles = (priority: string) => {
    switch (priority) {
        case "High":
            return { text: "text-[#D52B25]", bg: "bg-[#D52B25]/10", border: "border-[#D52B25]/30" };
        case "Medium":
            return { text: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/30" };
        case "Low":
            return { text: "text-[#22C55E]", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/30" };
        default:
            return { text: "text-[#7C7C7C]", bg: "bg-[#7C7C7C]/10", border: "border-[#7C7C7C]/30" };
    }
};

/* ================= SCHEMA ================= */

const taskSchema = z.object({
    title: z.string().min(1, "Title is required").trim(),
    emoji: z.string().optional().nullable(),
    dueDate: z.string(),
    priority: z.enum(["Low", "Medium", "High", "None"]),
});

/* ================= COMPONENT ================= */

const AddInboxTask = ({ list }: { list: any }) => {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector((state: RootState) => state.task.creating);

    // /* ✅ FIX: always sync listId when list changes */
    const [ListTitle, setListTitle] = React.useState(list?.name);
    const prevListIdRef = React.useRef<string | undefined>(list?.id);
    React.useEffect(() => {
        if (!list?.id) return;

        // only run if list really changed
        if (prevListIdRef.current !== list.id) {
            setListTitle(list.name);
            prevListIdRef.current = list.id;
        }
    }, [list?.id, list?.name]);

    const tomorrowISO = React.useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }, []);

    const dateRef = React.useRef<HTMLInputElement | null>(null);

    const [openMoreOptions, setOpenMoreOptions] = React.useState(false);
    const [taskOpen, setTaskOpen] = React.useState(false);
    const moreOptionRef = React.useRef<HTMLDivElement | null>(null);
    useOutsideClick(moreOptionRef, () => setOpenMoreOptions(false), openMoreOptions && !taskOpen);


    const [showPicker, setShowPicker] = React.useState(false);
    const pickerRef = React.useRef(null);
    useOutsideClick(pickerRef, () => setShowPicker(false), showPicker);
    const [emoji, setEmoji] = React.useState<string | null>(null);
    const [taskTitle, setTaskTitle] = React.useState("");
    const [dueDate, setDueDate] = React.useState(tomorrowISO);
    const [priority, setPriority] = React.useState<"Low" | "Medium" | "High" | "None">("Medium");
    const [formError, setFormError] = React.useState("");

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {
        const result = taskSchema.safeParse({
            title: taskTitle,
            emoji,
            dueDate,
            priority,
        });

        if (!result.success) {
            setFormError(result.error.issues.map(e => e.message).join(", "));
            return;
        }

        setFormError("");

        const action = await dispatch(
            createInboxTaskThunk({
                listId: "",
                title: result.data.title,
                emoji: result.data.emoji ?? null,
                dueDate: result.data.dueDate,
                priority: result.data.priority,
            })
        );

        if (createInboxTaskThunk.fulfilled.match(action)) {
            showToast("Task added!", "success");

            setTaskTitle("");
            setEmoji(null);
            setDueDate(tomorrowISO);
            setPriority("Medium");
        } else {
            showToast("Failed to create task", "error");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    };

    const priorityStyles = getPriorityStyles(priority);
    /* ================= UI ================= */

    return (
        <div className='w-full h-auto px-6 pt-6 pb-2'>
            <div className={`${formError ? "border-red-500" : "focus-within:border-[#4772FA] border-[#2D2D2D]"} w-full border h-auto px-3 bg-[#232323] rounded-xl`}>
                <div className='w-full h-10 flex gap-2 items-center'>

                    {/* Emoji */}
                    <div className='relative'>
                        <button className='mt-2' onClick={() => setShowPicker(prev => !prev)}>
                            {emoji ? emoji : <Annoyed className='text-[#7C7C7C]' size={18} />}
                        </button>

                        {showPicker && (
                            <div ref={pickerRef} className='absolute top-8 -left-4 z-40'>
                                <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                                    <Picker
                                        data={data}
                                        onEmojiSelect={(e: any) => {
                                            setEmoji(e.native);
                                            setShowPicker(false);
                                        }}
                                        theme="dark"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div className={`px-2 py-1 flex items-center gap-1 rounded-full border ${priorityStyles.bg} ${priorityStyles.border}`}>
                        <Flag size={13} className={priorityStyles.text} />
                        <p className={`text-[11px] font-medium ${priorityStyles.text}`}>{priority}</p>
                    </div>

                    {/* Input */}
                    <input
                        value={taskTitle}
                        onChange={(e) => {
                            setTaskTitle(e.target.value);
                            setFormError("");
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={`Add task to Inbox`}
                        disabled={loading}
                        className='w-full text-[14px] outline-none font-medium h-full bg-transparent'
                    />
                    <div className='relative'>
                        {/* Date */}
                        <button onClick={() => dateRef.current?.showPicker?.()} className='mt-0.5 flex items-center gap-1'>
                            <CalendarDays size={16} className='text-[#4772FA]' />
                        </button>

                        <input
                            ref={dateRef}
                            type="date"
                            min={tomorrowISO}
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="absolute rounded-xl opacity-0 top-1 left-0 pointer-events-none"
                        />
                    </div>
                    {/* More */}
                    <div ref={moreOptionRef} className='relative'>
                        <button className='mt-2' onClick={() => setOpenMoreOptions(!openMoreOptions)}>
                            <ChevronDown size={18} />
                        </button>

                        {openMoreOptions && (
                            <MoreOptions
                                close={() => setOpenMoreOptions(false)}
                                taskOpen={taskOpen}
                                setTaskOpen={setTaskOpen}
                                setPriority={setPriority}
                                priority={priority}
                                // setListId={setListId}
                                list={list}
                                setListTitle={setListTitle}
                                ListTitle={ListTitle}
                                isindex={true}
                            />
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="flex gap-2 text-[12px] text-[#7C7C7C] mt-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Creating task...
                    </div>
                )}
            </div>

            {formError && <p className='text-red-500 text-[12px] mt-1'>{formError}</p>}
        </div>
    );
};

export default AddInboxTask;