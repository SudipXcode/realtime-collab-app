"use client"
import { CalendarDays, Crown, HardDrive, Library, Plus, } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { usePath } from "@/hooks/usePathname"
// import { openList } from '@/redux/slices/ListSlice'
// import { useDispatch, useSelector } from 'react-redux'
// import { openPay } from '@/redux/slices/paySlice'
// import { fetchLists } from '@/redux/slices/ListsTitlesSlice'
// import { setSelectedTask } from '@/redux/slices/TaskDetails'
// import { setSelectedInboxTask } from '@/redux/slices/InboxDetails'

const ListNav: React.FC = (): JSX.Element => {
    const path = usePath()
    // const dispatch = useDispatch()
    const isNewlist = false
    // const { data, loading, loaded } = useSelector(
    //     (state: RootState) => state.listTitle
    // );

    // React.useEffect(() => {
    //     if (!loaded) {
    //         dispatch(fetchLists());
    //     }
    // }, [loaded, dispatch]);


    return (
        <div className='w-60 flex-none   flex flex-col  justify-center items-center bg-[#1C1C1C] border-r border-[#2D2D2D] h-screen  '>
            <div className='w-full flex flex-col items-center justify-start h-full px-3'>
                <div className='flex  w-full py-4 h-25  flex-col gap-0.5'>
                    <Link href={"/today"}>
                        <button
                            // onClick={() => {

                            //     dispatch(setSelectedInboxTask())
                            //     dispatch(setSelectedTask())
                            // }  }
                            title='Today' className={` ${path === "/today" ? "bg-[#2D2D2D]" : "hover:bg-[#232323] transition ease-in duration-150"} w-full  h-auto flex px-3 rounded-3xl py-2 gap-2 text-[13px] font-medium   items-center`}>
                            <CalendarDays strokeWidth={2} size={17} />
                            Today
                        </button>
                    </Link>

                    <Link href={"/inbox"}>
                        <button
                            //  onClick={() => {

                            //     dispatch(setSelectedInboxTask())
                            //     dispatch(setSelectedTask())
                            // }  }
                            title='Inbox' className={` ${path === "/inbox" ? "bg-[#2D2D2D]" : "hover:bg-[#232323] transition ease-in duration-150"} w-full  h-auto flex px-3 rounded-3xl py-2 gap-2 text-[13px] font-medium  items-center`}>
                            <span className='flex items-center gap-2'>
                                <HardDrive strokeWidth={2} size={17} />
                                Inbox
                            </span>
                        </button>
                    </Link>
                </div>
                <div className='w-full h-auto max-h-72  flex flex-col items-center justify-start pt-2 pb-3 border-t border-[#2D2D2D] '>
                    <button
                    //  onClick={() => dispatch(openList())} 
                     title='Create list' className='w-full flex-none text-[#7C7C7C] hover:text-white transition ease-linear duration-150 flex items-center justify-between h-7.5  px-3 text-[13px] font-medium  '>
                        Lists
                        <Plus strokeWidth={2} size={17} />
                    </button>
                    <div className='w-full pt-1 h-auto flex flex-col gap-1  justify-between  '>
                        {/* {loading ? <div className='w-full flex flex-col gap-2  h-full'>
                            {[140, 180, 120].map((w, i) => (
                                <div key={i} className="flex items-center gap-3 px-2 py-3 border-b border-white/5">
                                    <Shimmer className="h-4 w-4 rounded shrink-0" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <Shimmer className="h-3 rounded" style={{ width: w }} />
                                        <Shimmer className="h-2.5 rounded opacity-60" style={{ width: w + 60 }} />
                                    </div>

                                </div>
                            ))}
                        </div> : <div className='w-full flex flex-col gap-0.5 h-full'>
                            {data?.data?.slice(0, 5).map((i) => (
                                <Link key={i.id} href={`/inbox/${i.id}`}>
                                    <button onClick={() => {

                                        dispatch(setSelectedInboxTask())
                                        dispatch(setSelectedTask())
                                    }

                                    } title={i.title} className={`${path === `/inbox/${i.id}` ? "bg-[#2D2D2D]" : "hover:bg-[#232323] transition ease-in duration-150"} w-full h-auto flex px-3 rounded-3xl py-1.5 gap-2 text-[13px] font-medium items-center`}>
                                        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-full text-left">{i.title}</span>
                                    </button>
                                </Link>
                            ))}
                        </div>} */}
                        <Link href={"/library"}>
                            <button title='Library' className={` ${path === "/library" ? "bg-[#2D2D2D]" : "hover:bg-[#232323] transition ease-in duration-150"} w-full relative  h-auto flex px-3 rounded-3xl py-2 gap-2 text-[13px] font-medium   items-center`}>
                                <Library strokeWidth={2} size={18} />
                                Library
                                {isNewlist && <div className="w-3 h-3 flex items-center justify-center bg-[#232323] absolute right-1 top-1 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A33]" />
                                </div>
                                }
                            </button>
                        </Link>
                    </div>
                </div>
                <div className='flex flex-col gap-4 w-full py-4 border-t border-[#2D2D2D] h-auto '>
                    <div className='w-full h-auto flex flex-col gap-1'>
                        <p className='text-[#7C7C7C] text-[12px] font-medium'>Filters</p>
                        <div className='w-full h-auto p-3 rounded-xl bg-[#272727]'>
                            <p className='text-[#7C7C7C] text-[12px] font-medium'>Display tasks, filtered by list,date, priority, tag and more</p>
                        </div>
                    </div>
                    <div className='w-full h-auto flex flex-col gap-1'>
                        <p className='text-[#7C7C7C] text-[12px] font-medium'>Tags</p>
                        <div className='w-full h-auto p-3 rounded-xl bg-[#272727]'>
                            <p className='text-[#7C7C7C] text-[12px] font-medium'>Categorize your tasks with tags. Quickly select a tag by typing when adding tasks</p>
                        </div>
                    </div>
                </div>
            </div>
            <button
            //  onClick={() => dispatch(openPay())}
             title='Premium' className='w-full h-auto p-3 bg-[#232323] text-[12px]  font-medium  justify-center text-[#7C7C7C] hover:text-[#FF8A33] transition ease-linear duration-150 flex items-center gap-3'> <Crown size={17} /> Upgrade to Premium</button>
        </div>
    )
}

export default ListNav
