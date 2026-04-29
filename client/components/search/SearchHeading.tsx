import { Search, X } from 'lucide-react'
import React from 'react'
interface Props {
    value: string
    onChange: (v: string) => void
}
const SearchHeading = ({ value, onChange }: Props) => {
    return (
        <div className="w-full px-6 gap-3.5 h-auto flex items-center justify-between">
            <h3 className="text-[20px] flex-none font-bold">Searching for</h3>
            <div className='w-full focus-within:border-[#4772FA] border border-[#2D2D2D] flex  justify-between items-center h-10 px-3  bg-[#232323] rounded-xl'>
                <span className='w-full h-auto flex gap-2  items-center'>
                    <Search className='text-[#7C7C7C]' size={18} strokeWidth={2.5} />
                    <input type='text' value={value}
                        onChange={(e) => onChange(e.target.value)} placeholder='Task , lists or keywords...' className='w-full outline-none placeholder:text-[#7C7C7C]  text-[14px] font-medium  h-full ' />
                </span>

                <button onClick={() => onChange("")} className='text-[#a7a7a7] hover:text-[#4772FA]'>
                    <X size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    )
}

export default SearchHeading
