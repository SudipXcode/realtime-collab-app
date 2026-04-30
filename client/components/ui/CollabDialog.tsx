
"use client";

import React from 'react';
import { useOutsideClick } from '@/hooks/useOutSideclick';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from "next/navigation";
import { openCollab } from '@/redux/slices/CollabSlice';
import Image from 'next/image';
import { showToast } from '@/lib/toast';


import { useApi } from '@/hooks/useApi';

const CollabDialog = ({ open, onOpenChange }) => {
  const router = useRouter();
  const closeRef = React.useRef(null);
  useOutsideClick(closeRef, () => onOpenChange(false), open);

  const dispatch = useDispatch();

  const member = useSelector(
    (state: RootState) => state.collab.collabMembers
  );

  const owner = useSelector(
    (state: RootState) => state.collab.owner
  );
  const listId = useSelector(
    (state: RootState) => state.collab.listId
  );
  const isOwner = useSelector(
    (state: RootState) => state.collab.isowner
  );
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  /* ================= REMOVE ================= */
  const { callApi } = useApi("/api/lists/member");

  const handleRemove = async (memberId: string) => {
    if (!listId || !owner) return;

    setRemovingId(memberId);

    try {
      const res = await callApi({
        method: "DELETE",
        path: `/${listId}/${memberId}`,
      });

      if (res) {
        dispatch(
          openCollab({
            owner,
            members: member.filter((m: any) => m.id !== memberId), // ✅ works now
            listId,
            isowner: isOwner, // ✅ don't forget this
          })
        );


        showToast("Member removed from list", "success");
        onOpenChange(false)
        router.push("/library"); // 🚀 redirect here
      }

    } catch (err: any) {
      if (!err?.status || err.status >= 500) {
        console.error("Failed to remove member", err);
      }

      showToast(err?.message || "Failed to remove member", "error");

    } finally {
      setRemovingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className='w-full h-screen flex justify-center items-center bg-black/40 fixed top-0 z-50'>
      <div
        ref={closeRef}
        className='w-130 relative border border-[#2D2D2D] bg-[#242424] p-4 rounded-2xl'
      >

        {/* HEADER */}
        <div className='flex items-center justify-between'>
          <h3 className='text-[17px] font-bold'>Collaborations</h3>
          <button
            onClick={() => onOpenChange(false)}
            className='absolute top-4 right-4 text-[#9191a0] hover:text-[#4772FA]'
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* CONTENT */}
        <div className='mt-5 flex flex-col gap-3'>

          {/* ✅ OWNER */}
          {owner && (
            <div className='flex items-center gap-2'>
              <Image
                alt='owner'
                width={28}
                height={28}
                className='rounded-full'
                src={owner.img}
              />

              <div className='flex flex-col'>
                <p className='text-[14px] font-medium'>{owner.name}</p>
                <p className='text-[13px] text-[#7C7C7C]'>{owner.email}</p>
              </div>

              <p className='ml-auto text-[12px] text-[#7C7C7C]'>Owner</p>
            </div>
          )}

          {/* ✅ MEMBERS */}

          <div className='flex items-center gap-2'>

            <Image
              alt='member'
              width={28}
              height={28}
              className='rounded-full'
              src={member[0]?.img}
            />

            <div className='flex flex-col'>
              <p className='text-[14px] font-medium'>{member[0]?.name}</p>
              <p className='text-[13px] text-[#7C7C7C]'>{member[0]?.email}</p>
            </div>

            {isOwner ? <button
              onClick={() => handleRemove(member[0]?.id)}
              className='ml-auto flex gap-1 text-[12px] hover:text-red-600'
            >
              <X size={15} />
              {removingId === member[0]?.id ? "Removing..." : "Remove"}
            </button> : <p className='ml-auto text-[12px] text-[#7C7C7C]'>You (Guest)</p>}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CollabDialog;