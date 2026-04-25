import { ArrowUpNarrowWide, ChevronRight, Group } from "lucide-react"
import React from "react"

interface ViewOptionsProps {
  close: () => void
}

const ViewOptions: React.FC<ViewOptionsProps> = ({ close }) => {
  return (
    <div className="w-50 flex flex-col gap-0.5 h-auto px-1 py-2 border border-[#2D2D2D] bg-[#242424] shadow-lg z-30 rounded-xl absolute right-0 top-7.5">
      
      <button
        onClick={close}
        className="w-full px-2 h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl flex justify-between items-center"
      >
        <span className="flex items-center gap-1 text-[#d4d4d4] font-medium text-[13px]">
          <Group size={16} />
          Group by
        </span>

        <ChevronRight size={15} className="text-[#7C7C7C]" />
      </button>

      <button
        onClick={close}
        className="w-full px-2 h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl flex justify-between items-center"
      >
        <span className="flex items-center gap-1 text-[#d4d4d4] font-medium text-[13px]">
          <ArrowUpNarrowWide size={16} />
          Sort by
        </span>

        <ChevronRight size={15} className="text-[#7C7C7C]" />
      </button>

    </div>
  )
}

export default ViewOptions