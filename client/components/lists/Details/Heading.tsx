
"use client";

import { formatDate } from '@/lib/DateFormatting';
import { updateTaskDebouncedThunk } from '@/redux/thunk/taskThunk';
import { CalendarDays, Check, Flag } from 'lucide-react';

import React from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '@/lib/toast';

const todayISO = new Date().toISOString().split("T")[0];
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
const Heading = ({ selectedTask }) => {
  const dispatch = useDispatch();

  const dateRef = React.useRef<HTMLInputElement | null>(null);
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);

  /* ================= DATE ================= */

  const handleDateClick = () => {
    dateRef.current?.showPicker?.();
    setIsDateOpen(true);
  };

  const handleUpdateDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;

    dispatch(
      updateTaskDebouncedThunk({
        id: selectedTask.id,
        dueDate: newDate
          ? new Date(newDate).toISOString()
          : undefined,
      })
    );

    showToast("Due date updated", "success");
  };

  /* ================= CHECK ================= */

  const handleToggleCheck = () => {
    if (!selectedTask?.id) return;

    setIsChecking(true);

    dispatch(
      updateTaskDebouncedThunk({
        id: selectedTask.id,
        isChecked: !selectedTask.isChecked,
      })
    );

    showToast(
      !selectedTask.isChecked ? "Task completed" : "Task reopened",
      "success"
    );

    setTimeout(() => setIsChecking(false), 400);
  };

  /* ================= COLLAB ================= */



  const toDateInput = (iso?: string | null) => {
    if (!iso) return "";

    const date = new Date(iso);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  const priorityStyles = getPriorityStyles(selectedTask?.priority);
  return (
    <div className='w-full flex h-auto p-4 border-b border-[#2D2D2D]'>

      {/* LEFT */}
      <div className='flex-1 flex items-center gap-4'>

        {/* CHECKBOX */}
        <button
          onClick={handleToggleCheck}
          className={`${selectedTask?.isChecked
            ? "border-[#4772FA] bg-[#4772FA]"
            : "border-[#727272]"
            } w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center relative`}
        >
          {isChecking ? (
            <span className='absolute inset-0 rounded-sm border-2 border-white/20 border-t-white animate-spin' />
          ) : (
            selectedTask?.isChecked && <Check size={14} />
          )}
        </button>

        {/* DATE */}
        <div className='relative'>
          <button
            title='Add date'
            onClick={handleDateClick}
            className={`${isDateOpen || selectedTask?.dueDate
              ? 'text-[#4772FA]'
              : 'text-[#7C7C7C]'
              } gap-1 text-[12px] font-medium flex items-center`}
          >
            <CalendarDays size={16} strokeWidth={2} />
            {selectedTask?.dueDate
              ? formatDate(selectedTask.dueDate)
              : "Due date"}
          </button>

          <input
            ref={dateRef}
            type="date"
            min={todayISO}
            value={toDateInput(selectedTask?.dueDate)}
            onChange={handleUpdateDueDate}
            onBlur={() => setIsDateOpen(false)}
            className="absolute opacity-0 top-2 left-0 pointer-events-none"
          />
        </div>
      </div>
      <div className={`px-2 py-1 flex items-center gap-1 rounded-full border ${priorityStyles.bg} ${priorityStyles.border}`}>
        <Flag size={13} className={priorityStyles.text} />
        <p className={`text-[11px] font-medium ${priorityStyles.text}`}>{selectedTask?.priority}</p>
      </div>
      {/* RIGHT */}
      {/* <div className='pr-4 flex items-center justify-end'>
        {members?.length > 0 && (
          <button
            onClick={handleOpenCollab}
            title='Collaborations'
            className='relative'
          >
            <Image
              alt='owner'
              width={20}
              height={20}
              className='w-5.5 h-5.5 rounded-full'
              src={owner?.picture}
            />
            <Image
              alt='member'
              width={20}
              height={20}
              className='w-5.5 h-5.5 rounded-full absolute -right-3 top-0'
              src={members?.[0]?.user?.picture}
            />
          </button>
        )}
      </div> */}
    </div>
  );
};

export default Heading;