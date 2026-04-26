"use client"
import { useOutsideClick } from '@/hooks/useOutSideclick';
import { AlignEndHorizontal, AlignHorizontalJustifyEnd, AlignVerticalJustifyEnd, Annoyed, X } from 'lucide-react';
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import React from 'react'
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/lib/toast';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';
import { listSchema } from '@/validation/createList.validation';
import { useRouter } from 'next/navigation'
import { fetchLists } from '@/redux/slices/ListsTitlesSlice';
import { useDispatch } from 'react-redux';
import Imagelist from '../../public/8d9523d4621cf1ae7016c9bad1cb7533.png'
interface Member {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

const ListCreateDialog = ({ open, onOpenChange }) => {
    const closeRef = React.useRef(null)
    useOutsideClick(closeRef, () => onOpenChange(false), open);

    const [isSelecting, setIsSelecting] = React.useState(false)
    const dispatch = useDispatch()

    const [errors, setErrors] = React.useState<{ name?: string; type?: string }>({})

    const [showPicker, setShowPicker] = React.useState(false)
    const pickerRef = React.useRef(null)
    useOutsideClick(pickerRef, () => setShowPicker(false), showPicker)

    const [query, setQuery] = React.useState('')
    const [showDropdown, setShowDropdown] = React.useState(false)
    const dropdownRef = React.useRef(null)
    useOutsideClick(dropdownRef, () => setShowDropdown(false), showDropdown)

    const debouncedQuery = useDebounce(query, 600)

    const [results, setResults] = React.useState<Member[]>([])
    const [loading, setLoading] = React.useState(false)

    const [name, setName] = React.useState<string>("")
    const [emoji, setEmoji] = React.useState<string>("")
    const [selectedColor, setSelectedColor] = React.useState('#4772FA')
    const [listType, setListType] = React.useState("personal");
    const [member, setMember] = React.useState<Member | null>(null);

    const { callApi: postList } = useApi<{ message: string }>('/api/lists')
    const { callApi: searchMember } = useApi<Member[]>('/api/search/members')

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

    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const route = useRouter()

    const handleSubmitList = async () => {
        const formData = {
            name,
            type: listType,
            emoji: emoji || undefined,
            color: selectedColor,
            memberId: member?.id
        }

        const result = listSchema.safeParse(formData)

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors
            setErrors({
                name: fieldErrors.name?.[0],
                type: fieldErrors.type?.[0]
            })
            return
        }

        setErrors({})
        setIsSubmitting(true)

        const res = await postList({
            method: 'POST',
            body: result.data
        })

        setIsSubmitting(false)

        setName("")
        setEmoji("")
        setMember(null)

        if (res) {
            showToast("List created successfully", "success")

            window.dispatchEvent(
                new CustomEvent("new-list", {
                    detail: res.data,
                })
            );


            dispatch(fetchLists())
            route.push('/library')
            onOpenChange(false)
        } else {
            showToast("Free users can only create up to 5 lists. Upgrade to PRO", "warning")
            onOpenChange(false)
        }
    }

    if (!open) return null

    return (
        <div className='w-full h-screen flex justify-center items-center bg-black/40 fixed top-0 z-50'>
            <div ref={closeRef} className='w-190 relative flex justify-between border border-[#2D2D2D] bg-[#242424] h-110 rounded-2xl'>
                <button title='Close' onClick={() => onOpenChange(false)} className='absolute right-3 hover:text-[#4772FA] transition ease-linear duration-150 top-5'>
                    <X size={18} />
                </button>

                {/* ✅ FORM */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isSubmitting) return;
                        handleSubmitList();
                    }}
                    className='w-[60%] px-4 py-6 bg-[#1C1C1C] flex flex-col gap-4 justify-between rounded-l-2xl h-full'
                >
                    <h5 className='text-center text-[15px] font-semibold'>Add list</h5>

                    <div className='w-full flex flex-col items-center gap-6 h-full'>
                        {/* NAME */}
                        <div className='w-full h-auto flex flex-col gap-1'>
                            <div className={`${errors.name ? "border-red-500" : "border-[#3d3d3d]"} w-full border px-3 rounded-xl flex items-center gap-1`}>
                                <div className='w-auto flex items-center h-auto relative'>
                                    <button type="button" title='Emoji' onClick={() => setShowPicker(prev => !prev)}>
                                        {emoji ? (
                                            <span className="text-lg">{emoji}</span>
                                        ) : (
                                            <Annoyed className="text-[#7C7C7C]" size={18} />
                                        )}
                                    </button>

                                    {showPicker && (
                                        <div ref={pickerRef} className='absolute top-8 -left-4 z-40'>
                                            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                                                <Picker
                                                    data={data}
                                                    onEmojiSelect={(emoji) => {
                                                        setEmoji(emoji.native)
                                                        setShowPicker(false)
                                                    }}
                                                    theme="dark"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input
                                    value={name}
                                    type='text'
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder='Name'
                                    className='w-full h-9 pl-2 text-[13px] font-medium outline-none'
                                />
                            </div>

                            {errors.name && (
                                <p className='text-red-500 text-[11px]'>{errors.name}</p>
                            )}
                        </div>

                        {/* COLOR */}
                        <div className='w-full h-auto flex gap-3'>
                            <div className='flex-none w-30 h-auto'>
                                <p className='text-[13px] font-medium'>List color</p>
                            </div>
                            <div className='w-full h-auto flex items-center gap-2'>
                                {['#4772FA', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'].map((color) => (
                                    <button
                                        type="button"
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={`w-4 h-4 rounded-full flex-none transition-all duration-150 
                                         ${selectedColor === color ? 'ring-2 ring-offset-1 ring-offset-[#111] ring-white ' : 'hover:scale-110'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* VIEW TYPE */}
                        <div className='w-full h-auto flex gap-3'>
                            <div className='flex-none w-30 h-auto'>
                                <p className='text-[13px] font-medium '>View type</p>
                            </div>
                            <div className='w-full h-auto flex items-center gap-4'>
                                <button type="button" className='p-2 text-[#4772FA]'><AlignVerticalJustifyEnd size={18} /></button>
                                <button type="button" className='p-2'><AlignEndHorizontal size={18} /></button>
                                <button type="button" className='p-2'><AlignHorizontalJustifyEnd size={18} /></button>
                            </div>
                        </div>

                        {/* TYPE */}
                        <div className='w-full h-auto flex gap-3 items-center'>
                            <div className='flex-none w-30 h-auto'>
                                <p className='text-[13px] font-medium'>List type</p>
                            </div>
                            <div className='w-full h-auto'>
                                <select
                                    value={listType}
                                    onChange={(e) => setListType(e.target.value)}
                                    className={`${errors.type ? "border-red-500" : "border-[#2e2e2e]"} bg-[#1a1a1a] w-full h-9 text-[13px] font-medium border rounded-lg px-3 py-1 outline-none cursor-pointer`}
                                >
                                    <option value="personal">Personal</option>
                                    <option value="work">Work</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="other">Other</option>
                                </select>

                                {errors.type && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.type}</p>
                                )}
                            </div>
                        </div>
                        <div className='w-full h-auto flex gap-3 items-start'>
                            <div className='flex-none w-30 h-auto pt-2'>
                                <p className='text-[13px] font-medium'>Add members</p>
                            </div>
                            <div className='relative w-full' ref={dropdownRef}>
                                <input
                                    type="text"
                                    value={query}
                                    autoComplete="new-password"
                                    onChange={(e) => {
                                        setQuery(e.target.value)
                                        if (!showDropdown) setShowDropdown(true)
                                    }}
                                    placeholder='Search by name or email...'
                                    className='w-full  text-[13px] font-medium  placeholder-[#c4c4c4]  border border-[#2e2e2e]  rounded-lg px-3 h-9 outline-none'
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
                                                    setIsSelecting(true)   // 🔥 prevent search
                                                    setMember(m)
                                                    setQuery(m?.name)
                                                    setShowDropdown(false)
                                                }}
                                                className='flex items-center gap-3 px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer'
                                            >
                                                {m?.picture ? <Image width={50}
                                                    height={550}
                                                    alt="avatar"
                                                    src={m?.picture}
                                                    className='w-7 h-7 rounded-full   '
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
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className='w-full h-auto flex items-center justify-end gap-2'>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className='text-[#d4d4d4] hover:text-white transition ease-linear duration-150 text-[13px] font-medium py-1 rounded-full px-4 border border-[#3d3d3d]'
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-[#4772FA] text-[13px] font-medium py-1 rounded-full px-6 
                            ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            {isSubmitting ? "Adding..." : "Add"}
                        </button>
                    </div>
                </form>

                <div className='w-[40%] p-4 flex items-center justify-center rounded-l-2xl h-full'>
                    <Image width={200} height={200} alt='listimg' className='w-full h-auto' src={Imagelist} />
                </div>
            </div>
        </div>
    )
}

export default ListCreateDialog


