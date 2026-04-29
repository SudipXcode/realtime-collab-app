"use client"

import { Check, GripVertical } from "lucide-react"
import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { setSelectedTask } from "@/redux/slices/TaskDetails"
import { useDispatch, useSelector } from "react-redux"
import { formatDate } from "@/lib/DateFormatting"
import { updateTaskDebouncedThunk } from "@/redux/thunk/taskThunk"

const Task = ({ query, i, id }) => {
  const dispatch = useDispatch()

  /* ================= REDUX ================= */

  const reduxTask = useSelector((state: any) =>
    state.task.tasks.find((t: any) => t.id === i.id)
  )

  // ✅ Safe fallback
  const task = reduxTask ?? i

  /* ================= DND ================= */

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: String(task?.id || id), // ✅ always safe
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  /* ================= HIGHLIGHT ================= */

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

  /* ================= CHECK ================= */

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation()

    dispatch(
      updateTaskDebouncedThunk({
        id: task.id,
        isChecked: !task.isChecked,
      })
    )
  }
  function limitWords(text: string, limit = 20) {
    if (!text) return ""

    const words = text.split(" ")

    if (words.length <= limit) return text

    return words.slice(0, limit).join(" ") + "..."
  }
  /* ================= UI ================= */

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="hover:bg-[#232323] cursor-pointer w-full transition group relative px-2 rounded-xl"
    >
      {/* Drag */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute text-[#a7a7a7] opacity-0 group-hover:opacity-100 h-full -left-4 cursor-grab"
      >
        <GripVertical size={15} />
      </button>

      <div className="flex items-center gap-2 w-full border-b py-2 border-[#2D2D2D]">

        {/* Checkbox */}
        <div
          onClick={handleCheck}
          className={`${task.isChecked
              ? "border-[#4772FA] bg-[#4772FA]"
              : "border-[#727272]"
            } w-4.5 h-4.5 rounded-md border-2 cursor-pointer flex items-center justify-center shrink-0`}
        >
          {task.isChecked && <Check size={14} />}
        </div>

        {/* Content */}
        <div
          onClick={() => dispatch(setSelectedTask(task))}
          className="flex items-center gap-2 w-full min-w-0"
        >
          {/* LEFT */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">

            {/* TITLE */}
            <h5
              className={`${task.isChecked
                  ? "line-through text-[#999999]"
                  : ""
                } text-[14px] font-medium truncate`}
            >
              {highlight(task.title, query)}
            </h5>

            {/* DESC */}
            {task.desc && (
              <p className="text-[#7C7C7C] text-[12px] ">
                {highlight(limitWords(task.desc, 25), query)}
              </p>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex  items-center gap-2 shrink-0 whitespace-nowrap">
            <p className="text-[#7C7C7C] text-[12px]">
              {formatDate(task?.dueDate)}
            </p>

            <span className="text-[#999999] text-[12px] font-semibold">
              {i?.listName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Task
// "use client"
// import { Check, GripVertical } from "lucide-react"
// import React from "react"
// import { useSortable } from "@dnd-kit/sortable"
// import { CSS } from "@dnd-kit/utilities"
// import { setSelectedTask } from "@/redux/slices/TaskDetails"
// import { useDispatch, useSelector } from "react-redux"
// import { formatDate } from "@/lib/DateFormatting"
// import { updateTaskDebouncedThunk } from "@/redux/thunk/taskThunk"

//  const Task = ({ query, i, id }) => {
//   const dispatch = useDispatch()

//   const task = useSelector((state: any) =>
//     state.task.tasks.find((t: any) => t.id === i.id)
//   )
//   if (!task) return null // ✅ NO FALLBACK
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//   } = useSortable({ id: String(task.id) })

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   }

//   function highlight(title?: string, query?: string) {
//     if (!title) return ""
//     if (!query) return title

//     const parts = title.split(new RegExp(`(${query})`, "gi"))

//     return parts.map((part, index) =>
//       part.toLowerCase() === query.toLowerCase() ? (
//         <span key={index} className="bg-[#c68b168f] text-gray-200 px-0.5">
//           {part}
//         </span>
//       ) : (
//         part
//       )
//     )
//   }

//   const handleCheck = (e: React.MouseEvent) => {
//     e.stopPropagation()

//     dispatch(
//       updateTaskDebouncedThunk({
//         id: task.id, // ✅ use redux task
//         isChecked: !task.isChecked,
//       })
//     )
//   }



//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="hover:bg-[#232323] cursor-pointer w-full transition group relative px-2 rounded-xl"
//     >
//       <button
//         {...attributes}
//         {...listeners}
//         onClick={(e) => e.stopPropagation()}
//         className="absolute text-[#a7a7a7] opacity-0 group-hover:opacity-100 h-full -left-4 cursor-grab"
//       >
//         <GripVertical size={15} />
//       </button>

//       <div className="flex items-center gap-2 w-full border-b py-2 border-[#2D2D2D]">

//         {/* Checkbox */}
//         <div
//           onClick={handleCheck}
//           className={`${task.isChecked
//               ? "border-[#4772FA] bg-[#4772FA]"
//               : "border-[#727272]"
//             } w-4.5 h-4.5 rounded-md border-2 cursor-pointer`}
//         >
//           {task.isChecked && <Check size={14} />}
//         </div>

//         {/* Content */}
//         <div
//           onClick={() => dispatch(setSelectedTask(task))}
//           className="w-full flex justify-between pl-1"
//         >
//           <div className="flex flex-col gap-1">
//             <h5
//               className={`${task.isChecked
//                   ? "line-through text-[#999999]"
//                   : ""
//                 } text-[14px] font-medium`}
//             >
//               {highlight(task.title, query)}
//             </h5>

//             {task.desc && (
//               <p className="text-[#7C7C7C] text-[12px]">
//                 {highlight(task.desc, query)}
//               </p>
//             )}
//           </div>

//           <div className="flex gap-2 items-center">
//             <p className="text-[#7C7C7C] text-[12px]">
//               {formatDate(task?.dueDate)}
//             </p>

//             <span className="text-[#999999] text-[12px] font-semibold">
//               {i?.listName} {/* listName still from API */}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// export default Task;