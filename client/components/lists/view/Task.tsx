

import { useOutsideClick } from '@/hooks/useOutSideclick'
import { Check, EllipsisVertical, GripVertical } from 'lucide-react'
import React from 'react'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import MoreOptions from '../MoreOptions'
import { formatDate } from '@/lib/DateFormatting'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedTask } from '@/redux/slices/TaskDetails'
import { deleteTaskThunk, updateTaskDebouncedThunk } from '@/redux/thunk/taskThunk'
import { showToast } from '@/lib/toast'

const Task = ({ i, openTaskOptions, list, setOpenTaskOptions }) => {

  const dispatch = useDispatch()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(i.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const [taskOpen, setTaskOpen] = React.useState(false)
  const moreOptionRef = React.useRef(null)

  useOutsideClick(
    moreOptionRef,
    () => setOpenTaskOptions(null),
    openTaskOptions && !taskOpen
  )
  const selectedTask = useSelector((state) => state.task.selectedTask);
  // If this task isn't open in Details yet, load it into Redux first
  const ensureSelected = () => {
    // if (!isSelected) openTask(i.id)
  }


  const handleDelete = async () => {
    const res = await dispatch(
      deleteTaskThunk({
        taskId: i?.id,
        listId: list?.id
      })
    );

    if (deleteTaskThunk.fulfilled.match(res)) {
      showToast("Task delete!", "success")
    } else {
      const errorMsg =
        res.payload?.message || "You don't have delete permission as guest !";
      showToast(errorMsg, "warning")

    }
  };

  const [isChecking, setIsChecking] = React.useState(false)
  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation()

    setIsChecking(true)

    dispatch(updateTaskDebouncedThunk({
      id: i.id,
      isChecked: !i.isChecked
    }))

    showToast(
      !i?.isChecked ? "Task completed" : "Task reopened",
      "success"
    );
    setTimeout(() => {
      setIsChecking(false)
    }, 700) // match debounce (600ms + buffer)
  }
  const updatePriority = (priority: string) => {
    dispatch(updateTaskDebouncedThunk({
      id: i.id,
      priority
    }))
  }
  const [ListTitle, setListTitle] = React.useState(list?.title);

  const updateList = (listId: string) => {
    dispatch(updateTaskDebouncedThunk({
      id: i.id,
      listId   // ✅ THIS triggers API
    }))
  }
  const isOverdue = (date?: string) => {
    if (!date) return false

    const today = new Date()
    const taskDate = new Date(date)

    // normalize (remove time)
    today.setHours(0, 0, 0, 0)
    taskDate.setHours(0, 0, 0, 0)

    return taskDate < today
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      key={i.id}
      onClick={ensureSelected}  // clicking row opens it in Details
      className={`${selectedTask?.id === i.id ? 'bg-[#2D2D2D]' : 'hover:bg-[#232323]'} w-full transition ease-in duration-150 group relative  h-auto px-2 rounded-xl cursor-pointer`}
    >
      <button
        title='Sort'
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        className='absolute text-[#a7a7a7] outline-none opacity-0 group-hover:opacity-100 transition ease-linear duration-200 w-auto h-full rounded-xl cursor-grab -left-4'
      >
        <GripVertical size={15} />
      </button>

      <div className='flex items-center gap-2 w-full border-b h-11.5 border-[#2D2D2D]'>

        {/* ── Checkbox ── */}
        <div
          onClick={handleCheck}
          title='Check box'
          className={`${i.isChecked ? "border-[#4772FA] bg-[#4772FA]" : "border-[#727272]"}
        flex-none cursor-pointer w-4.5 h-4.5 rounded-md border-2 relative`}
        >

          {isChecking ? (
            <span className='absolute inset-0 rounded-sm border-2 border-white/20 border-t-white animate-spin' />
          ) : (
            i?.isChecked && <Check size={14} />
          )}
        </div>
        {/* ── Title + due date — live from Redux if selected ── */}
        <div onClick={() => dispatch(setSelectedTask(i))} className='w-full h-full  flex items-center justify-between pl-1'>
          <h5
            className={`
    text-[14px] font-medium
    ${i?.isChecked ? "line-through decoration-2 text-[#7C7C7C]" : ""}
    ${!i?.isChecked && isOverdue(i?.dueDate) ? "line-through decoration-2 decoration-red-500 text-red-400" : ""}
  `}
          >
            {i.title}
          </h5>
          <div className='w-auto h-auto flex-none flex items-center gap-4 '>
            <button className='text-[#7C7C7C] text-[12px] flex items-center gap-2 font-medium'>
              {formatDate(i?.dueDate)}
            </button>
            {/* {i?.listName && <p className='font-medium text-[#c7c7c7] text-[12px] '>{list?.title}</p>} */}
          </div>
        </div>

        {/* ── More options ── */}
        <div className='relative w-auto h-auto flex-none flex items-center'>
          <button
            title='More options'
            onClick={e => { e.stopPropagation(); setOpenTaskOptions(i.id) }}
            className='flex-none text-[#727272] hover:text-white transition ease-linear duration-150'
          >
            <EllipsisVertical size={15} strokeWidth={2.5} />
          </button>

          {openTaskOptions === i.id && (
            <MoreOptions
              ref={moreOptionRef}
              list={list}
              position="top-0"
              deleteoption={true}
              close={() => setOpenTaskOptions(null)}
              handleDelete={handleDelete}
              taskOpen={taskOpen}
              setTaskOpen={setTaskOpen}
              setListTitle={setListTitle}
              ListTitle={ListTitle}
              // ↓ these now hit Redux + API
              priority={i.priority}
              setPriority={p => { ensureSelected(); updatePriority(p) }}
              attagement={i?.attachment}
              setAttagement={(file) => {
                dispatch(
                  updateTaskDebouncedThunk({
                    id: i.id,
                    attachment: file, // ✅ ONLY file
                  })
                );
              }}

              setList={(l) => {
                ensureSelected()
                updateList(l)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Task
