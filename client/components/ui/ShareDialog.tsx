"use client"
import React from 'react'

import { useOutsideClick } from '@/hooks/useOutSideclick';
import { Globe, Plus, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store'; // ✅ FIXED
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useApi';
import { useRouter } from "next/navigation"

import Image from 'next/image';
import { showToast } from '@/lib/toast';

const ShareDialog = ({ open, onOpenChange }) => {
    const route = useRouter()

    const closeRef = React.useRef(null)
    useOutsideClick(closeRef, () => onOpenChange(false), open);

    // ✅ FIX typing + correct selector
    const list = useSelector((state: RootState) => state.share)
    const listId = list?.listId
    const owner = list?.owner

    const [query, setQuery] = React.useState('')
    const [showDropdown, setShowDropdown] = React.useState(false)
    const dropdownRef = React.useRef(null)
    useOutsideClick(dropdownRef, () => setShowDropdown(false), showDropdown)

    const debouncedQuery = useDebounce(query, 600)
    const [member, setMember] = React.useState<Member | null>(null);

    const [results, setResults] = React.useState<Member[]>([])
    const [loading, setLoading] = React.useState(false)
    const [isSelecting, setIsSelecting] = React.useState(false)
    const [loadingPost, setLoadingPost] = React.useState(false) // ✅ FIX

    const { callApi: searchMember } = useApi<Member[]>('/api/search/members')

    const { callApi: addMember } = useApi('/api/lists/member')

    React.useEffect(() => {
        if (isSelecting) return;

        if (!debouncedQuery || debouncedQuery.length < 2) {
            return
        }

        const fetchMembers = async () => {
            setLoading(true)

            const res = await searchMember({
                method: 'GET',
                params: { query: debouncedQuery },
                silent: true
            })

            if (res) {
                setResults(res.data || [])
                setShowDropdown(true)
            }

            setLoading(false)
        }

        fetchMembers()
    }, [debouncedQuery, searchMember, isSelecting])

    // ✅ FIX complete function
    const handleAddMember = async () => {
        if (!member || !listId) return

        setLoadingPost(true)

        const res = await addMember({
            method: "POST",
            body: { listId, memberId: member.id },
            silent: true
        })

        setLoadingPost(false)

        // ❌ Handle errors with custom messages
        if (!res?.success) {
            const msg = res?.message || ""

            if (msg.toLowerCase().includes("already a member")) {
                showToast("Only one entry allowed — this user is already in the list", "error")
            } else if (msg.toLowerCase().includes("already sent")) {
                showToast("Invite already sent to this user", "error")
            } else {
                showToast("You already added this member to the list", "error")
            }
            onOpenChange(false)
            setMember(null)
            setQuery("")
            return
        }

        // ✅ Success
        showToast("Invitation sent successfully", "success")

        // reset
        setMember(null)
        setQuery("")
        setResults([])
        setShowDropdown(false)

        onOpenChange(false)
        route.push("/library")
    }
    if (!open) return null

    return (
        <div className='w-full h-screen flex  justify-center items-center bg-black/40 fixed top-0 z-50'>
            <div ref={closeRef} className='w-150 relative  flex flex-col border border-[#2D2D2D]  bg-[#242424] h-auto p-4  rounded-2xl'>
                <div className='w-full h-auto flex items-center justify-between'>
                    <h3 className='text-[18px] font-bold'>Share {list?.title} </h3>
                    <button onClick={() => onOpenChange(false)} className='absolute top-4 text-[#9191a0]  hover:text-[#4772FA] transition ease-linear duration-150 right-4'>
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className='relative mt-4 w-full' ref={dropdownRef}>
                    <input
                        type="text"
                        value={query}
                        autoComplete="new-password"
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsSelecting(false) // ✅ important fix
                            if (!showDropdown) setShowDropdown(true)
                        }}
                        placeholder='Search by name or email...'
                        className='w-full  focus:border-[#4772FA] text-[13px] font-medium  placeholder-[#c4c4c4]  border border-[#383838]  rounded-lg px-3 h-9 outline-none'
                    />

                    {showDropdown && (
                        <div className='absolute top-full left-0 w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg z-50'>

                            {loading && (
                                <div className='px-3 py-2 text-sm text-gray-400'>
                                    Searching...
                                </div>
                            )}
                            {!loading && results.length === 0 && (
                                <div className='px-3 py-2 text-sm text-gray-400'>
                                    No users found
                                </div>
                            )}

                            {results.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => {
                                        setIsSelecting(true)
                                        setMember(m)
                                        setQuery(m?.name)
                                        setShowDropdown(false)
                                    }}
                                    className='flex items-center gap-3 px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer'
                                >
                                    {m?.picture ? <Image width={50}
                                        height={50}
                                        alt="avatar"
                                        src={m?.picture}
                                        className='w-7 h-7 rounded-full'
                                    /> : <div className='w-7 h-7 rounded-full bg-[#4772FA] flex items-center justify-center text-white'>
                                        {m?.name[0]}
                                    </div>
                                    }
                                    <div>
                                        <p className='text-sm'>{m?.name}</p>
                                        <p className='text-xs text-gray-400'>{m?.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='w-full h-auto mt-4'>
                    <p className='text-[13px] text-[#c2c2c2] font-semibold'>Only you can access this doc.</p>

                    <div className='w-full mt-4 h-auto flex items-center justify-between'>
                        <div className='w-auto h-auto flex gap-2 items-center'>
                            <Globe size={18} className='text-[#c2c2c2]' />
                            <p className='text-[13px]  font-medium'>Collaborator in this workspace</p>
                        </div>
                        <p className='text-[13px] text-[#7C7C7C] font-medium'>Can edit</p>
                    </div>

                    <div className='w-full mt-4 h-auto flex items-center justify-between'>
                        <div className='w-auto h-auto flex gap-2 items-center'>
                            <Image alt='img' width={20} height={20} className='w-5 rounded-full h-5' src={owner?.picture} />
                            <p className='text-[13px]  font-medium'>{owner?.name}</p>
                        </div>
                        <p className='text-[13px] text-[#7C7C7C] font-medium'>Owner</p>
                    </div>
                </div>

                <div className='flex w-full mt-5 pt-4 border-t border-[#2D2D2D] items-center justify-between'>
                    <p className='text-[13px] text-[#c2c2c2] font-medium'>Invite users to work with you</p>
                    <button
                        onClick={handleAddMember} // ✅ FIX
                        disabled={!member || loadingPost} // ✅ FIX
                        className='bg-[#4772FA] text-[13px] font-medium py-1.5 rounded-full px-3 flex items-center gap-1 disabled:opacity-50'
                    >
                        {loadingPost ? "Adding..." : "Add members"}
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ShareDialog