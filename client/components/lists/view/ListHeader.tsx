"use client"
import ListOptions from '@/components/library/ListOptions'
import { useOutsideClick } from '@/hooks/useOutSideclick'
import { openCollab } from '@/redux/slices/CollabSlice'
import { openShare } from '@/redux/slices/ShareSlice'
import { Ellipsis, Star, UserPlus } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useDispatch, } from 'react-redux'
const ListHeader = ({ list, handleFunctionFavourite, handleDeleteList, isOwner }) => {
  const [openListOptions, setOpenListOptions] = React.useState(false)
  const ListOptionRef = React.useRef(null)
  useOutsideClick(ListOptionRef, () => setOpenListOptions(false), openListOptions)

  const dispatch = useDispatch()

  const handleOpenCollab = () => {
    const normalizedOwner = {
      id: list?.owner?.id,
      name: list?.owner?.name,
      email: list?.owner?.email,
      img: list?.owner?.picture,
    };

    const normalizedMembers = list?.members?.map((m) => ({
      userId: m?.id,  // optional
      name: m?.name,
      email: m?.email,
      img: m?.picture,
    })) || [];

    dispatch(openCollab({
      owner: normalizedOwner,
      members: normalizedMembers,
      listId: list?.id,
      isOwner: isOwner
    }));
  };

  return (
    <div className='w-full px-6   h-8 flex items-center justify-between'>
      <div className='w-auto h-auto flex gap-2 items-center'>
        <h3 className='text-[20px] font-bold'>{list?.name}</h3>
        {isOwner ? <p className='text-[11px] px-2 h-5 flex items-center bg-orange-500/20 border border-orange-600 rounded-full font-semibold text-orange-600'>Owner</p> : <p className='text-[11px] px-2 h-5 flex items-center bg-green-500/20 border border-green-600 rounded-full font-semibold text-green-600'>Guest</p>}
      </div>
      <div className='w-auto flex gap-3 items-center h-auto'>
        <button onClick={() => handleFunctionFavourite(list?.id)} title='Favourite' className='h-8 w-8 flex items-center justify-center  rounded-xl hover:bg-[#2D2D2D] transition ease-in duration-150'>
          {list?.isFavourite ? <Star size={16} fill='#fcfcfc' /> : <Star size={16} />}
        </button>
        {list?.isShared && list?.members.length > 0 ?
          <div title='Collaborations'
            onClick={handleOpenCollab}
            className='relative cursor-pointer mr-3  '
          >
            <Image
              alt='owner'
              width={20}
              height={20}
              className='w-5 h-5 rounded-full'
              src={list?.owner?.picture}
            />
            <Image
              alt='member'
              width={20}
              height={20}
              className='w-5 h-5 rounded-full absolute -right-3 top-0'
              src={list?.members?.[0]?.picture}
            />

          </div> :
          <button
            onClick={() =>
              dispatch(openShare({ id: list?.id, owner: list?.owner, name: list?.name }))
            }
            title='Share'
            className='h-8 w-8 flex items-center justify-center  rounded-xl hover:bg-[#2D2D2D] transition ease-in duration-150'>
            <UserPlus strokeWidth={2.5} size={17} />
          </button>}
        <div ref={ListOptionRef} className='relative '>
          <button title="More options" onClick={() => setOpenListOptions(!openListOptions)} className={` ${openListOptions ? "bg-[#2D2D2D]" : "hover:bg-[#2D2D2D]"} h-8 w-8 flex items-center justify-center  rounded-xl  transition ease-in duration-150`}>
            <Ellipsis strokeWidth={2.5} size={17} />
          </button>
          {openListOptions && <ListOptions handleDeleteList={handleDeleteList} position="top-8" handleFunctionFavourite={handleFunctionFavourite} list={list} close={() => setOpenListOptions(false)} />}
        </div>
      </div>
    </div >
  )
}

export default ListHeader
