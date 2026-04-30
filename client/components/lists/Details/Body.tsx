
"use client";

import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useDispatch } from "react-redux";

import { updateTaskDebouncedThunk } from "@/redux/thunk/taskThunk";
import { AppDispatch } from "@/redux/store";

const TITLE_MAX = 120;
const DESC_MAX = 5000;


const Body: React.FC<any> = ({ selectedTask }) => {
 const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = React.useState(selectedTask.title || "");
  const [description, setDescription] = React.useState(
    selectedTask.description || ""
  );

  const prev = React.useRef({
    title: selectedTask.title || "",
    description: selectedTask.description || "",
    id: selectedTask.id,
  });

  const skipUpdate = React.useRef(true);

  /* ================= SYNC ================= */
  React.useEffect(() => {
    setTitle(selectedTask.title || "");
    setDescription(selectedTask.description || "");

    prev.current = {
      title: selectedTask.title || "",
      description: selectedTask.description || "",
      id: selectedTask.id,
    };

    skipUpdate.current = true;
  }, [selectedTask.id]); // ✅ ONLY ID

  /* ================= UPDATE ================= */
  React.useEffect(() => {
    if (skipUpdate.current) {
      skipUpdate.current = false;
      return;
    }

    if (prev.current.id !== selectedTask.id) return;

    const updates: {
      title?: string;
      description?: string;
    } = {};

    if (prev.current.title !== title) updates.title = title;
    if (prev.current.description !== description)
      updates.description = description;

    if (Object.keys(updates).length === 0) return;

    dispatch(
      updateTaskDebouncedThunk({
        id: selectedTask.id,
        ...updates,
      })
    );

    prev.current = {
      title,
      description,
      id: selectedTask.id,
    };
  }, [title, description, selectedTask.id, dispatch]);

  return (
    <div className="w-full h-full overflow-y-auto scrollbar p-4">
      <div className="flex flex-col">

        {/* TITLE */}
        <TextareaAutosize
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title…"
          minRows={1}
          /* ❌ NO maxRows */
          className={`w-full text-[20px] font-bold resize-none outline-none overflow-hidden ${selectedTask.isChecked
              ? "line-through text-[#7C7C7C]"
              : ""
            }`}
        />

        <p className="text-[10px] text-[#7C7C7C] text-right">
          {title.length}/{TITLE_MAX}
        </p>

        {/* DESCRIPTION */}
        <TextareaAutosize
          value={description}
          maxLength={DESC_MAX}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description…"
          minRows={2}
          /* ❌ NO maxRows */
          className="w-full mt-2 text-[15px] resize-none outline-none overflow-hidden"
        />

        <p className="text-[10px] text-[#7C7C7C] text-right">
          {description.length}/{DESC_MAX}
        </p>

      </div>
    </div>
  );
};

export default Body;
