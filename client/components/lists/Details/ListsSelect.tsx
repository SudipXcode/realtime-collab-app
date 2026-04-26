import React from 'react'
import { useSelector } from 'react-redux';
// ListsSelect.tsx
const ListsSelect = ({  setList, setListTitle, setListId, className, setTaskOpen, close }) => {
    const data = useSelector((state: RootState) => state.listTitle.data);

    return (
        <div className={`${className ? className : "w-full"} flex flex-col px-1 py-2`}>
            {data?.data?.map((i) => (
                <button
                    onClick={() => {
                        if (setListId) setListId(i.id)       // UI update
                        if (setList) setList(i.id)
                        setTaskOpen(false)
                        if (setListTitle) setListTitle(i?.title)
                        close()
                    }}
                    key={i.id}
                    className='w-full px-2 flex items-center gap-2 text-[#d4d4d4] font-medium text-[13px] h-8 hover:bg-[#2F2F2F] transition ease-in duration-150 rounded-xl'
                >
                    <span className="truncate">{i?.title}</span>
                </button>
            ))}

        </div>
    )
}

export default ListsSelect
