
// 'use client'
// import { ArrowLeftRight, EllipsisVertical } from 'lucide-react'
// import React from 'react'
// import { useOutsideClick } from '@/hooks/useOutSideclick'
// import ListsSelect from './ListsSelect'
// import MoreOptions from '../../library/ListOptions'
// import { deleteTaskThunk, updateTaskDebouncedThunk } from '@/redux/thunk/taskThunk'
// import { useDispatch } from 'react-redux'
// import { showToast } from '@/lib/toast'


// const Footer = ({ selectedTask, list }) => {
//   const dispatch = useDispatch()

//   const [openTaskSelect, setOpenListSelect] = React.useState(false)
//   const moreOptionRef = React.useRef(null)
//   useOutsideClick(moreOptionRef, () => setOpenListSelect(false), openTaskSelect)

//   const [openMoreOptions, setOpenMoreOptions] = React.useState(false)
//   const openMoreOptionsRef = React.useRef<HTMLDivElement>(null)
//   useOutsideClick(openMoreOptionsRef, () => setOpenMoreOptions(false), openMoreOptions)

//   const handleDelete = async () => {
//     const res = await dispatch(
//       deleteTaskThunk({
//         taskId: selectedTask?.id,
//         listId: list?.id
//       })
//     );

//     if (deleteTaskThunk.fulfilled.match(res)) {
//       showToast("Task delete!", "success")
//     } else {
//       const errorMsg =
//         res.payload?.message || "You don't have delete permission as guest !";
//       showToast(errorMsg, "warning")

//     }
//   };

//   const updateList = (listId: string) => {
//     dispatch(updateTaskDebouncedThunk({
//       id: selectedTask.id,
//       listId   // ✅ THIS triggers API
//     }))
//   }

//   return (
//     <div className='w-full flex justify-between items-center h-auto p-4 border-t border-[#2D2D2D]'>
//       <div ref={moreOptionRef} className='relative w-auto h-auto flex items-center'>
//         <button
//           title="Move to"
//           onClick={() => setOpenListSelect(!openTaskSelect)}
//           className='flex-none flex items-center gap-1 text-[13px] font-medium text-white'
//         >
//           <ArrowLeftRight size={15} strokeWidth={2.5} />
//           {selectedTask ? selectedTask?.listName  : "Inbox"}
//         </button>


//         {openTaskSelect && (
//           <ListsSelect
//             className="w-45 border border-[#2D2D2D] bg-[#242424] shadow-lg z-40 rounded-xl h-auto absolute bottom-7 -left-1"
//             setList={(l) => {
//               // ensureSelected()
//               updateList(l)
//             }}
//             close={() => setOpenListSelect(false)}
//             // id={selectedTask.id}
//             setTaskOpen={setOpenListSelect}
//           />
//         )}
//       </div>

//       <div ref={openMoreOptionsRef} className='relative'>
//         <button
//           onClick={() => setOpenMoreOptions(!openMoreOptions)}
//           title="More options"
//           className='flex-none text-[#a3a3a3] flex items-center gap-1 text-[13px] font-medium hover:text-white transition ease-linear duration-150'
//         >
//           <EllipsisVertical size={17} strokeWidth={2.5} />
//         </button>
//         {openMoreOptions && (
//           <MoreOptions
//             compo="details"
//             id={selectedTask.id}
//             position="bottom-7"
//             i={{ isFavourite: false }}
//             close={() => setOpenMoreOptions(false)}
//             handleDelete={handleDelete}
//           />
//         )}
//       </div>
//     </div>
//   )
// }

// export default Footer


'use client'

import { ArrowLeftRight, EllipsisVertical } from 'lucide-react'
import React from 'react'
import { useOutsideClick } from '@/hooks/useOutSideclick'
import ListsSelect from './ListsSelect'
import MoreOptions from '../../library/ListOptions'
import { deleteTaskThunk, moveTaskThunk } from '@/redux/thunk/taskThunk'
import { useDispatch } from 'react-redux'
import { showToast } from '@/lib/toast'
import { setSelectedTask } from '@/redux/slices/TaskDetails'

const Footer = ({ selectedTask }) => {
  const dispatch = useDispatch()

  const [openTaskSelect, setOpenListSelect] = React.useState(false)
  const moreOptionRef = React.useRef(null)

  const [openMoreOptions, setOpenMoreOptions] = React.useState(false)
  const openMoreOptionsRef = React.useRef<HTMLDivElement>(null)

  const [loadingDelete, setLoadingDelete] = React.useState(false)
  const [loadingMove, setLoadingMove] = React.useState(false)

  useOutsideClick(moreOptionRef, () => setOpenListSelect(false), openTaskSelect)
  useOutsideClick(openMoreOptionsRef, () => setOpenMoreOptions(false), openMoreOptions)

  /* ================= DELETE TASK ================= */

  const handleDelete = async () => {
    if (!selectedTask?.id || !selectedTask?.listId) return

    setLoadingDelete(true)

    try {
      const res = await dispatch(
        deleteTaskThunk({
          taskId: selectedTask.id,
          listId: selectedTask?.listId,
        })
      );

      if (deleteTaskThunk.fulfilled.match(res)) {
        showToast('Task deleted!', 'success')
      } else {
        const message =
          (res.payload as unknown)?.message ||
          "You don't have permission to delete this task"

        showToast(message, 'warning')
      }
    } catch (err: unknown) {
      showToast(err?.message || 'Failed to delete task', 'error')
    } finally {
      setLoadingDelete(false)
    }
  }
  // const handleDelete = async () => {
  //   setLoadingDelete(true)
  //   const res = await dispatch(
  //     deleteTaskThunk({
  //       taskId: selectedTask.id,
  //       listId: list.id,
  //     })
  //   );

  //   if (deleteTaskThunk.fulfilled.match(res)) {
  //     showToast("Task deleted!", "success");
  //   } else {
  //     const errorMsg =
  //       res.payload?.message ||
  //       "You don't have delete permission as guest!";
  //     showToast(errorMsg, "warning");
  //   }
  // };
  /* ================= MOVE TASK ================= */
  // const updateList = async (newListId: string) => {
  //   const result = await dispatch(
  //     moveTaskThunk({ taskId: i.id, newListId })
  //   );

  //   if (moveTaskThunk.fulfilled.match(result)) {
  //     dispatch(setSelectedTask())
  //   }
  // };
  const updateList = async (listId: string) => {
    if (!selectedTask?.id) return

    setLoadingMove(true)

    try {
      const result = await dispatch(
        moveTaskThunk({ taskId: selectedTask?.id, newListId: listId })
      );

      if (moveTaskThunk.fulfilled.match(result)) {
        dispatch(setSelectedTask())
        showToast('Task moved successfully!', 'success')
      }

    } catch (err: unknown) {
      showToast(err?.message || 'Failed to move task', 'error')
    } finally {
      setLoadingMove(false)
      setOpenListSelect(false)
    }
  }

  return (
    <div className='w-full flex justify-between items-center h-auto p-4 border-t border-[#2D2D2D]'>

      {/* ================= MOVE ================= */}
      <div
        ref={moreOptionRef}
        className='relative w-auto h-auto flex items-center'
      >
        <button
          title="Move to"
          disabled={loadingMove}
          onClick={() => setOpenListSelect(!openTaskSelect)}
          className='flex-none flex items-center gap-1 text-[13px] font-medium text-white disabled:opacity-50'
        >
          <ArrowLeftRight size={15} strokeWidth={2.5} />
          {selectedTask?.listName || 'Inbox'}
        </button>

        {openTaskSelect && (
          <ListsSelect
            className="w-45 border border-[#2D2D2D] bg-[#242424] shadow-lg z-40 rounded-xl h-auto absolute bottom-7 -left-1"
            setList={updateList}
            close={() => setOpenListSelect(false)}
            setTaskOpen={setOpenListSelect}
          />
        )}
      </div>

      {/* ================= MORE OPTIONS ================= */}
      <div ref={openMoreOptionsRef} className='relative'>
        <button
          onClick={() => setOpenMoreOptions(!openMoreOptions)}
          title="More options"
          disabled={loadingDelete}
          className='flex-none text-[#a3a3a3] flex items-center gap-1 text-[13px] font-medium hover:text-white transition ease-linear duration-150 disabled:opacity-50'
        >
          <EllipsisVertical size={17} strokeWidth={2.5} />
        </button>

        {openMoreOptions && (
          <MoreOptions
            compo="details"
            id={selectedTask.id}
            position="bottom-7"
            i={{ isFavourite: false }}
            close={() => setOpenMoreOptions(false)}
            handleDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}

export default Footer