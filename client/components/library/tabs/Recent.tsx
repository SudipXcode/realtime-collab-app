
"use client"

import { History } from "lucide-react"
import React from "react"
import List from "../List"
import SelectList from "../SelectList"
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

// =============================
// TYPE
// =============================
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

const Recent: React.FC<Props> = ({
  data,
  handleDeleteList,
  selectedLists,
  setSelectedLists,
  handleFunctionFavourite,
}) => {
  // ✅ only store order (not full data)
  const [order, setOrder] = React.useState<string[]>([])


  // ✅ derive items (NO useEffect)
  const items = React.useMemo(() => {
    const safeData = Array.isArray(data) ? data : []

    if (!order.length) return safeData

    const map = new Map(safeData.map((i) => [i.id, i]))

    return order
      .map((id) => map.get(id))
      .filter(Boolean) as LibraryList[]
  }, [data, order])

  // =============================
  // DRAG
  // =============================
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)

    const newItems = arrayMove(items, oldIndex, newIndex)

    setOrder(newItems.map((i) => i.id))
  }

  const [openListOptions, setOpenListOptions] =
    React.useState<string | null>(null)

  return (
    <div className="w-full pt-6 h-full">
      {selectedLists.length !== 0 && (
        <SelectList
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          handleDeleteList={handleDeleteList}
        />
      )}

      {items.length ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full px-8 flex flex-col gap-0.5">
              {items.map((i) => (
                <List
                  key={i.id}
                  i={{
                    ...i,
                    title: i.name,
                    date: i.createdAt,
                    createby: i.isOwner
                      ? "You"
                      : i.owner?.name ?? "Unknown",
                    isactive: i.isActive,
                    shared: i.isShared,
                  }}
                  openListOptions={openListOptions}
                  setOpenListOptions={setOpenListOptions}
                  handleFunctionFavourite={() =>
                    handleFunctionFavourite(i.id)
                  }
                  handleDeleteList={() =>
                    handleDeleteList(i.id)
                  }
                  setSelectedLists={setSelectedLists}
                  selectedLists={selectedLists}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="px-10 pt-6 flex items-center gap-6">
          <div className="w-12 h-12 flex items-center justify-center bg-[#2F2F2F] rounded-lg rotate-45">
            <History className="text-[#7C7C7C]" size={20} />
          </div>
          <h5 className="text-[14px] text-[#7C7C7C] font-medium">
            You don’t have any recent list yet!
          </h5>
        </div>
      )}
    </div>
  )
}

export default Recent