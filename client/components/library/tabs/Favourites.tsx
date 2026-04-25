

"use client"

import { Star } from 'lucide-react'
import React from 'react'
import List from '../List'
import SelectList from '../SelectList'
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"

// ✅ SAME TYPE AS RECENT
export interface LibraryList {
    id: string
    name: string
    createdAt: string
    isActive: boolean
    isFavourite: boolean

    owner: {
        id: string
        name: string
    }

    isOwner: boolean
    isShared: boolean
    isPending: boolean

    members: {
        id: string
        name: string
        email: string
    }[]
}

interface Props {
    data: LibraryList[] | null
    handleDeleteList: (id?: string) => void
    selectedLists: string[]
    setSelectedLists: React.Dispatch<React.SetStateAction<string[]>>
    handleFunctionFavourite: (id: string) => void
}

const Favourites: React.FC<Props> = ({
    data,
    handleDeleteList,
    selectedLists,
    setSelectedLists,
    handleFunctionFavourite,
}) => {

    // =============================
    // ✅ LOCAL STATE
    // =============================
    const [items, setItems] = React.useState<LibraryList[]>([])

    React.useEffect(() => {
        setItems(data ?? [])
    }, [data])

    // =============================
    // ✅ DRAG
    // =============================
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setItems((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === active.id)
            const newIndex = prev.findIndex((item) => item.id === over.id)

            return arrayMove(prev, oldIndex, newIndex)
        })
    }

    const [openListOptions, setOpenListOptions] = React.useState<string | null>(null)

    // =============================
    // UI
    // =============================
    return (
        <div className='w-full pt-6 h-full'>

            {/* ✅ MULTI SELECT */}
            {selectedLists.length !== 0 && (
                <SelectList
                    selectedLists={selectedLists}
                    setSelectedLists={setSelectedLists}
                   handleDeleteList={handleDeleteList}
                />
            )}

            {/* ================= LIST ================= */}
            {items.length ? (
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className='w-full h-auto px-8 flex flex-col gap-0.5'>
                            {items.map((i) => (
                                <List
                                    key={i.id}
                                    i={{
                                        ...i,

                                        // ✅ SAME MAPPING AS RECENT
                                        title: i.name,
                                        date: i.createdAt,
                                        createby: i.isOwner ? "You" : i.owner?.name ?? "Unknown",
                                        isactive: i.isActive,
                                        shared: i.isShared,
                                    }}
                                    openListOptions={openListOptions}
                                    setOpenListOptions={setOpenListOptions}
                                    handleFunctionFavourite={() => handleFunctionFavourite(i.id)}
                                    handleDeleteList={() => handleDeleteList(i.id)}
                                    setSelectedLists={setSelectedLists}
                                    selectedLists={selectedLists}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className='px-10 pt-6 w-full h-auto flex items-center gap-6'>
                    <div className="w-12 h-12 flex items-center justify-center bg-[#2F2F2F] rounded-lg rotate-45">
                        <Star className='text-[#7C7C7C]' size={20} />
                    </div>
                    <h5 className='text-[14px] text-[#7C7C7C] font-medium'>
                        You don’t have any favourites list yet!
                    </h5>
                </div>
            )}
        </div>
    )
}

export default Favourites