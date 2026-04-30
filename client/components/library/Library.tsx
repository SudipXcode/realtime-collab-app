"use client";

import { ChevronDown, Plus, Star } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import LibraryTabs from "./LibraryTabs";
import Approvel from "./tabs/Approvel";
import Collaboration from "./tabs/Collaboration";
import Favourites from "./tabs/Favourites";
import Recent from "./tabs/Recent";
import SortOptions from "./SortOptions";
import { useOutsideClick } from "@/hooks/useOutSideclick";
import PageHeading from "../ui/PageHeading";
import { useDispatch } from "react-redux";
import { openList } from "@/redux/slices/ListSlice";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/lib/toast";
import { fetchLists } from "@/redux/slices/ListsTitlesSlice";
import type { AppDispatch } from "@/redux/store";

/* ================= TYPES ================= */

type Tab = "Recent" | "Favourites" | "Collaboration" | "Approval";
export type Sort = "Date" | "Time" | "Tags" | "Priority";

const tabs: Tab[] = ["Recent", "Favourites", "Collaboration", "Approval"];

export interface ListItem {
  id: string;
  name: string;
  isFavourite: boolean;
  isShared: boolean;
  isPending: boolean;
}

interface LibraryResponse {
  success?: boolean;
  message?: string;
  data?: {
    lists: ListItem[];
    hasPending?: boolean;
    pendingCount?: number;
    isFavourite?: boolean;
    status?: string;
    listId?: string;
  };
}

/* ================= HELPERS ================= */

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

/* ================= COMPONENT ================= */

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Recent");
  const [sort, setSort] = useState<Sort>("Date");
  const [openSort, setOpenSort] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  const sortRef = useRef<HTMLDivElement>(null);
  useOutsideClick(sortRef, () => setOpenSort(false), openSort);

  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, callApi, setData } =
    useApi<LibraryResponse>("/api/library");

  const { callApi: deleteTask } =
    useApi<LibraryResponse>("/api/library");

  const { callApi: toggleFavourite } =
    useApi<LibraryResponse>("/api/library/favourite");

  const { callApi: postApproval } =
    useApi<LibraryResponse>("/api/library/approval");

  /* ================= FETCH ================= */

  const fetchLibrary = useCallback(() => {
    callApi({
      method: "GET",
      params: { tab: activeTab, sort },
    });
  }, [callApi, activeTab, sort]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  useEffect(() => {
    const handler = () => fetchLibrary();
    window.addEventListener("new-list", handler);
    return () => window.removeEventListener("new-list", handler);
  }, [fetchLibrary]);

  /* ================= ACTIONS ================= */

  const handleDeleteList = async (id?: string) => {
    const ids = id ? [id] : selectedLists;
    if (!data?.data?.lists) return;

    const prev = data;

    setData((p) => {
      if (!p?.data) return p;

      return {
        ...p,
        data: {
          ...p.data,
          lists: p.data.lists.filter((item) => !ids.includes(item.id)),
        },
      };
    });

    setSelectedLists([]);

    try {
      const res = await deleteTask({
        method: "DELETE",
        body: { listId: ids },
      });

      if (!res?.success) {
        setData(prev);
        showToast("Delete failed", "warning");
        return;
      }

      showToast("Task Deleted", "success");
      dispatch(fetchLists());
    } catch {
      setData(prev);
      showToast("Error deleting", "error");
    }
  };

  const handleFunctionFavourite = async (id: string) => {
    if (!data?.data?.lists) return;

    const prev = data;

    setData((p) => {
      if (!p?.data) return p;

      let updated = p.data.lists.map((item) =>
        item.id === id
          ? { ...item, isFavourite: !item.isFavourite }
          : item
      );

      if (activeTab === "Favourites") {
        updated = updated.filter((i) => i.isFavourite);
      }

      return {
        ...p,
        data: {
          ...p.data,
          lists: updated,
        },
      };
    });

    try {
      const res = await toggleFavourite({
        method: "PATCH",
        body: { listId: id },
      });

      if (!res?.success) {
        setData(prev);
        showToast("Favourite update failed", "warning");
        return;
      }

      showToast("Favourite updated", "success");
    } catch (err) {
      setData(prev);
      showToast(getErrorMessage(err, "Favourite update failed"), "error");
    }
  };

  const handleFunctionApprove = async (id: string, state: boolean) => {
    try {
      await postApproval({
        method: "PATCH",
        body: { listId: id, isApproved: state },
      });

      fetchLibrary();
      dispatch(fetchLists());
    } catch (err) {
      showToast(getErrorMessage(err, "Approval failed"), "error");
    }
  };

  /* ================= SHIMMER ================= */

  const Shimmer = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <div
      className={`relative overflow-hidden rounded bg-white/5 ${className}`}
      style={style}
    />
  );

  /* ================= UI ================= */

  const lists = data?.data?.lists ?? [];

  return (
    <div className="w-full flex flex-col py-6 h-screen">
      <PageHeading title="All Lists" />

      <div className="w-full mt-6 px-6">
        {data?.data?.hasPending && (
          <div className="w-full mb-6 flex items-center gap-2 px-4 py-2 rounded-3xl bg-[#4772FA]/10">
            <Star size={14} fill="#4772FA" className="text-[#4772FA]" />
            <p className="text-[13px] text-[#4772FA]">
              You have pending list on approval. Visit approval tab.
            </p>
          </div>
        )}

        <div className="w-full flex items-center">
          <LibraryTabs
            tabs={tabs}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            hasPending={data?.data?.hasPending}
          />

          <div className="flex-1 flex justify-end gap-3">
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setOpenSort(!openSort)}
                className="px-3 h-8 rounded-full flex items-center text-[13px] gap-1 text-[#a7a7a7]"
              >
                Sort by {sort}
                <ChevronDown size={16} />
              </button>

              {openSort && (
                <SortOptions
                  setSort={setSort}
                  sort={sort}
                  close={() => setOpenSort(false)}
                />
              )}
            </div>

            <button
              onClick={() => dispatch(openList())}
              className="px-3 h-8 rounded-full flex items-center text-[13px] gap-1 text-[#a7a7a7]"
            >
              <Plus size={16} /> Create list
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-8 h-full pt-6">
          {[140, 180, 120, 160, 200].map((w, i) => (
            <div key={i} className="flex gap-3 p-2 border-b border-white/5">
              <Shimmer className="h-4 w-4" />
              <div className="flex flex-col gap-2 flex-1">
                <Shimmer className="h-3" style={{ width: w }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center h-full">
          {activeTab === "Recent" && (
            <Recent
              data={lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
            />
          )}

          {activeTab === "Favourites" && (
            <Favourites
              data={lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
            />
          )}

          {activeTab === "Collaboration" && (
            <Collaboration
              data={lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
            />
          )}

          {activeTab === "Approval" && (
            <Approvel
              data={lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
              handleFunctionApprove={handleFunctionApprove}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Library;