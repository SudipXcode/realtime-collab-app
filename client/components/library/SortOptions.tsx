import { Check } from "lucide-react"
import React from "react"
import { Sort } from "./Library"

interface SortOptionsProps {
  sort: Sort
  setSort: React.Dispatch<React.SetStateAction<Sort>>
  close: () => void
}

const options: Sort[] = ["Date", "Time", "Tags", "Priority"]

const SortOptions: React.FC<SortOptionsProps> = ({ sort, setSort, close }) => {
  const handleSort = (value: Sort) => {
    setSort(value)
    close()
  }

  return (
    <div className="absolute flex flex-col top-8.5 z-30 bg-[#242424] border border-[#2D2D2D] w-45 rounded-xl h-auto p-2 right-0">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSort(option)}
          className={`${
            sort === option
              ? "text-[#4772FA]"
              : "hover:bg-[#2F2F2F]"
          } px-3 h-7.5 w-full flex items-center justify-between text-[12px] font-medium rounded-xl`}
        >
          {option}
          {sort === option && <Check size={16} />}
        </button>
      ))}
    </div>
  )
}

export default SortOptions