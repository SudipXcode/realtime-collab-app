import { Activity, CircleCheckBig, ListTree, Plus, Printer, Share2, View } from 'lucide-react'
import React from 'react'

const MoreOptions: React.FC<any> = ({ close, className }) => {
  return (
    <div className={` ${className ? className : "right-0 top-8"} w-45 flex flex-col gap-0.5 h-auto px-1 py-2 border border-[#2D2D2D] bg-[#242424] shadow-lg z-30 rounded-xl absolute  `}>
      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <CircleCheckBig size={16} />
        Hide Completed
      </button>
      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <ListTree size={16} />
        Show Details
      </button>

      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium  text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <View size={16} />
        View Options
      </button>
      <div className='w-full h-auto  mt-2 border-t border-[#2F2F2F]'></div>
      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <Plus size={17} />
        Add Section
      </button>

      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <Share2 size={16} />
        Share
      </button>

      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <Activity size={16} />
        List Activities
      </button>
      <button onClick={close} className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl    '>
        <Printer size={16} />
        Print
      </button>
    </div>
  )
}

export default MoreOptions
