

import { formatDate } from '@/lib/DateFormatting';
import { showToast } from '@/lib/toast';
import { AppDispatch } from '@/redux/store';
import { updateTaskDebouncedThunk } from '@/redux/thunk/taskThunk';
import { Check } from 'lucide-react';
import React from 'react';
import { useDispatch } from 'react-redux';

const Task: React.FC<any> = ({ task, query, listId }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [isChecking, setIsChecking] = React.useState(false);
  const [checked, setChecked] = React.useState(task?.isChecked);

  React.useEffect(() => {
    setChecked(task?.isChecked);
  }, [task?.isChecked]);

  const isOverdue = (date?: string) => {
    if (!date) return false;

    const today = new Date();
    const taskDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    return taskDate < today;
  };

  function limitWords(text: string, limit = 20) {
    if (!text) return "";

    const words = text.split(" ");

    if (words.length <= limit) return text;

    return words.slice(0, limit).join(" ") + "...";
  }

  function highlight(text?: string, query?: string) {
    if (!text) return "";
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));

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
    );
  }

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!task) return;

    const newChecked = !checked;

    setChecked(newChecked);
    setIsChecking(true);

    dispatch(
      updateTaskDebouncedThunk({
        id: task.id,
        listId,
        isChecked: newChecked,
      })
    );

    showToast(
      newChecked ? "Task completed" : "Task reopened",
      "success"
    );

    setTimeout(() => setIsChecking(false), 700);
  };

  return (
    <div
      key={task?.id}
      className="w-full hover:bg-[#232323] rounded-xl cursor-pointer transition ease-linear duration-150 h-auto flex items-center gap-3 p-2 border-b border-[#2D2D2D]"
    >
      <div
        onClick={handleCheck}
        title="Check box"
        className={`${checked
          ? "border-[#4772FA] bg-[#4772FA]"
          : "border-[#727272]"
          } flex-none cursor-pointer w-4.5 h-4.5 rounded-md border-2 relative`}
      >
        {isChecking ? (
          <span className="absolute inset-0 rounded-sm border-2 border-white/20 border-t-white animate-spin" />
        ) : (
          checked && <Check size={14} />
        )}
      </div>

      <div className="w-full flex items-center justify-between h-auto">
        <h5
          className={`text-[14px] font-medium
            ${checked ? "line-through text-[#7C7C7C]" : ""}
            ${!checked && isOverdue(task?.dueDate)
              ? "line-through decoration-red-500 text-red-400"
              : ""
            }`}
        >
          {highlight(limitWords(task?.title, 25), query)}
        </h5>

        <button className="text-[#7C7C7C] text-[12px] flex items-center gap-2 font-medium">
          {formatDate(task?.dueDate)}
        </button>
      </div>
    </div>
  );
};

export default Task;