import { ArrowRightLeft, ChevronRight, FlagTriangleRight, Settings, Tag, Trash2 } from 'lucide-react'
import React, { useRef } from 'react'
import ListsSelect from './Details/ListsSelect'
import { useOutsideClick } from '@/hooks/useOutSideclick'

interface MoreOptionsProps {
    close: () => void
    listsOpen: boolean
    setListsOpen: (val: boolean) => void
    deleteoption?: boolean
    position?: string
    setList?: (listId: string) => void
    setListId?: (listId: string) => void
    ListTitle?: string
    isindex?: boolean
}

const MoreOptions: React.FC<MoreOptionsProps> = ({ isindex, setList, setListId, ListTitle, setListTitle, ref, close, taskOpen, setTaskOpen, deleteoption, position, priority, setPriority, handleDelete }) => {
    const containerRef = useRef<HTMLDivElement>(null)


    useOutsideClick(containerRef, () => setTaskOpen(false), taskOpen)

    const formattedpriority =
        priority.charAt(0) + priority.slice(1).toLowerCase();

    return (
        <div
            ref={ref}
            className={`${position ? position : "top-8"}  w-46  flex flex-col gap-0.5 h-auto px-1 py-2 border border-[#2D2D2D] bg-[#242424] shadow-lg z-40 rounded-xl absolute -right-2`}  >
            <div className='w-full px-2 h-auto flex flex-col gap-2'>
                <p className='text-[12px] font-medium text-[#7C7C7C]'>Priority</p>
                <div className='w-full pt-1 pb-3 h-auto flex items-center justify-between'>
                    <button onClick={() => {
                        setPriority("High")
                        close()
                    }} title='High priority' className={`${formattedpriority === "High" ? "opacity-100" : "opacity-20"} p-1`}>
                        <FlagTriangleRight fill='#D52B25' className="text-[#D52B25]" size={15} />
                    </button>
                    <button onClick={() => {
                        setPriority("Medium")
                        close()
                    }}

                        title='Medium priority' className={`${formattedpriority === "Medium" ? "opacity-100" : "opacity-20"} p-1`}>
                        <FlagTriangleRight fill='#FAA80C' className="text-[#FAA80C]" size={15} />
                    </button>
                    <button

                        onClick={() => {
                            setPriority("Low")
                            close()
                        }}
                        title='Low priority' className={`${formattedpriority === "Low" ? "opacity-100" : "opacity-20"} p-1`}>
                        <FlagTriangleRight fill="#4772FB" className="text-[#4772FB]" size={15} />
                    </button>
                    <button
                        onClick={() => {
                            setPriority("None")
                            close()
                        }} title='None' className={`${formattedpriority === "None" ? "opacity-100" : "opacity-20"} p-1`}>
                        <FlagTriangleRight fill='#ffffff' className="text-[#ffffff]" size={15} />
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className='relative w-full h-auto'

            >
                <button
                    onClick={() => {
                        if (!isindex)
                            setTaskOpen(!taskOpen)
                    }}
                    title='Move to list'
                    className='w-full outline-none px-2 flex items-center justify-between gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'
                >
                    <span className='flex items-center gap-2 min-w-0 flex-1'>
                        <ArrowRightLeft size={16} className="flex-none" />
                        <span className='truncate block'>{ListTitle ? ListTitle : "Inbox"}</span>
                    </span>
                    {!isindex && <ChevronRight
                        size={14}
                        className={`flex-none transition-transform duration-150 ${taskOpen ? 'rotate-90' : ''}`}
                    />}
                </button>

                {taskOpen && <ListsSelect setList={setList} close={close} setListTitle={setListTitle} setListId={setListId} setTaskOpen={setTaskOpen} />}
            </div>

            <button title='Tags' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                <Tag size={16} />
                Tags
            </button>

            <button title='Settings' className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'>
                <Settings size={16} />
                Input Box Settings
            </button>
            {deleteoption && <button onClick={() => {
                handleDelete(1)
                close()
            }} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] hover:text-red-600 hover:bg-red-500/10 font-medium text-[13px] h-8  transition ease-in duration-150 rounded-xl    '>
                <Trash2 size={16} />
                Delete
            </button>}
        </div>
    )
}

export default MoreOptions