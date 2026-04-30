import { ArrowRightLeft, Copy, Pencil, Pin, Share2, Star, Trash2 } from 'lucide-react'
import React from 'react'

const ListOptions: React.FC<any> = ({ handleDelete, compo, close, ref, list, position, handleDeleteList, handleFunctionFavourite }) => {
    return (
        <div ref={ref} className={` ${position ? position : "top-0"} w-49 flex flex-col gap-0.5 h-auto px-1 py-2 border border-[#2D2D2D] bg-[#242424] shadow-lg z-30 rounded-xl absolute right-0  `}>
            <button className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
                <Pencil size={16} />
                Rename
            </button>
            <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
                <Share2 size={16} />
                Share
            </button>

            <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium  text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
                <Copy size={16} />
                Copy
            </button>
            <div className='w-full h-auto  mt-2 border-t border-[#2F2F2F]'></div>
            <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
                <ArrowRightLeft size={16} />
                Move
            </button>

            <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
                <Pin size={16} />
                Pin
            </button>

            {compo !== "details" &&
                <button onClick={(e) => {
                    e.preventDefault()
                    handleFunctionFavourite(list?.id)
                    close()
                }} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
                    {list?.isFavourite ? <Star size={16} fill='#a7a7a7' /> : <Star size={16} />}
                    {list?.isFavourite ? "Remove from" : "Add to"}  favourites
                </button>
            }
            {compo === "details" ?
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        handleDelete()
                        close()
                    }}
                    className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] hover:text-red-600 hover:bg-red-500/10 font-medium text-[13px] h-8  transition ease-in duration-150 rounded-xl    '>
                    <Trash2 size={16} />
                    Delete
                </button> :
                <button onClick={(e) => {
                    e.preventDefault()
                    handleDeleteList(list?.id)
                    close()
                }}
                    className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] hover:text-red-600 hover:bg-red-500/10 font-medium text-[13px] h-8  transition ease-in duration-150 rounded-xl    '>
                    <Trash2 size={16} />
                    Delete
                </button>
            }
        </div>
    )
}

export default ListOptions
