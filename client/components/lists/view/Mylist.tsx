

"use client";

import React, { useState } from "react";
import ListHeader from "./ListHeader";
import AddTask from "../AddTask";
import AllTasks from "./AllTasks";
import { showToast } from "@/lib/toast";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";



/* ================= TYPE ================= */



/* ================= HELPERS ================= */

function getToastMessage(res: any, fallback: string) {
  return res?.message || res?.data?.message || fallback;
}

/* ================= COMPONENT ================= */

const Mylist: React.FC<any> = ({ initialData }) => {


  const [list, setList] = useState< any>(initialData ?? null);

  const router = useRouter();

  /* ================= LOADING STATES ================= */

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  /* ================= API HOOKS ================= */

  const { callApi: deleteListApi } =
    useApi<{ success: boolean; message?: string; data?: unknown }>(
      "/api/library"
    );

  const { callApi: toggleFavouriteApi } =
    useApi<{ message?: string }>("/api/library/favourite");

  /* ================= DELETE LIST ================= */

  const handleDeleteList = async (id: string) => {
    if (!list) return;

    const prevData = structuredClone(list);
    setDeletingId(id);

    // optimistic update
    setList((prev) => {
      if (!prev || !prev.data) return prev;

      return {
        ...prev,
        data: {
          ...prev.data,
          lists: prev.data.lists.filter((item) => item.id !== id),
        },
      };
    });

    try {
      const res = await deleteListApi({
        method: "DELETE",
        body: { listId: [id] },
      });

      if (!res?.success) {
        showToast(
          getToastMessage(res, "You are not allowed to delete this list"),
          "error"
        );
        setList(prevData);
        return;
      }

      showToast(
        getToastMessage(res, "List deleted successfully"),
        "success"
      );

      router.push("/library");
    } catch (err: any) {
      setList(prevData);
      showToast(err?.message || "Failed to delete list", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= TOGGLE FAVOURITE ================= */

  const handleFunctionFavourite = async (id: string) => {
    if (!list) return;

    const prevData = structuredClone(list);
    setFavouriteLoading(true);

    // optimistic update
    setList((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        isFavourite: !prev.isFavourite,
      };
    });

    try {
      const res = await toggleFavouriteApi({
        method: "PATCH",
        body: { listId: id },
      });

      showToast(getToastMessage(res, "Favourite updated"), "success");
    } catch (err: any) {
      setList(prevData);
      showToast(err?.message || "Failed to update favourite", "error");
    } finally {
      setFavouriteLoading(false);
    }
  };


  /* ================= EMPTY STATE ================= */

  if (!list) {
    return (
      <div className="w-full flex items-center justify-center h-screen text-white/40">
        List not found.
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="w-full flex flex-col py-6 h-screen">
      <ListHeader
        handleDeleteList={handleDeleteList}
        handleFunctionFavourite={handleFunctionFavourite}
        list={list}
        isOwner={list?.isOwner}
        deletingId={deletingId}
        favouriteLoading={favouriteLoading}
      />
      <AddTask list={list} />
      <AllTasks list={list} />
    </div>
  );
};

export default Mylist;