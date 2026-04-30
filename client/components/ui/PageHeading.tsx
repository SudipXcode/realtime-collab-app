"use client"
import { ArrowUpDown, Ellipsis } from 'lucide-react'
import React from 'react'
import MoreOptions from './MoreOptions'
import ViewOptions from './ViewOptions'
import { useOutsideClick } from '@/hooks/useOutSideclick'
type PageHeadingProps = {
    title: string;
};

const PageHeading: React.FC<PageHeadingProps> = ({
    title,
}): React.JSX.Element => {
    const [openMoreOptions, setOpenMoreOptions] = React.useState<boolean>(false)
    const openMoreOptionsRef = React.useRef<HTMLDivElement>(null)
    useOutsideClick(openMoreOptionsRef, () => setOpenMoreOptions(false), openMoreOptions)

    const [openViewOptions, setOpenViewOptions] = React.useState<boolean>(false)
    const openViewRef = React.useRef<HTMLDivElement>(null)
    useOutsideClick(openViewRef, () => setOpenViewOptions(false), openViewOptions)
    return (
        <div className="w-full px-6 h-8 flex justify-between">
            <h3 className="text-[20px] font-bold">{title}</h3>
            <div className="w-auto flex gap-3 h-auto">
                <div ref={openViewRef} className='relative'>
                    <button
                        onClick={() => setOpenViewOptions(!openViewOptions)}
                        title="View"
                        className={` ${openViewOptions ? "text-[#4772FA] bg-[#2D2D2D]" : "hover:bg-[#2D2D2D]"} h-7.5 w-7.5 flex items-center justify-center rounded-xl  transition ease-in duration-150`}
                    >
                        <ArrowUpDown strokeWidth={2} size={17} />
                    </button>
                    {openViewOptions && <ViewOptions close={() => setOpenViewOptions(false)} />}
                </div>
                <div ref={openMoreOptionsRef} className='relative'>
                    <button
                        onClick={() => setOpenMoreOptions(!openMoreOptions)}
                        title="More options"
                        className={` ${openMoreOptions ? "text-[#4772FA] bg-[#2D2D2D]" : "hover:bg-[#2D2D2D]"} h-7.5 w-7.5 flex items-center justify-center rounded-xl  transition ease-in duration-150`}
                    >
                        <Ellipsis strokeWidth={2.5} size={18} />
                    </button>
                    {openMoreOptions && <MoreOptions close={() => setOpenMoreOptions(false)} />}
                </div>
            </div>
        </div>
    )
}

export default PageHeading
