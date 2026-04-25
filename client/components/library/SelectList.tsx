import React from 'react'

const SelectList = ({ selectedLists, setSelectedLists, handleDeleteList }) => {
    return (
        <div className='px-8 flex items-center gap-8 pb-4 w-full h-auto'>
            <button
                onClick={() => setSelectedLists((prev) => prev.slice(1))}
                className='text-[#ff5233] text-[13px] font-medium'
            >
                Cancel
            </button>
            <button
                onClick={() => setSelectedLists([])}
                className='text-[#ff5233] text-[13px] font-medium'
            >
                Deselect all
            </button>
            <button onClick={() => handleDeleteList()} className='text-[#ff5233] text-[13px] font-medium'>
                Delete  ({selectedLists?.length})
            </button>
        </div>
    )
}

export default SelectList
