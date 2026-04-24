
"use client";

import { ChevronDown, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
// import LibraryTabs from "./LibraryTabs";
// import Approvel from "./tabs/Approvel";
// import Collaboration from "./tabs/Collaboration";
// import Favourites from "./tabs/Favourites";
// import Recent from "./tabs/Recent";
// import SortOptions from "./SortOptions";
// import { useOutsideClick } from "@/hooks/useOutSideclick";
// import PageHeading from "../ui/PageHeading";
// import { useDispatch } from "react-redux";
// import { openList } from "@/redux/slices/ListSlice";
// import { useApi } from "@/hooks/useApi";
// import { showToast } from "@/lib/toast";
// import { fetchLists } from "@/redux/slices/ListsTitlesSlice";

// /* ================= TYPES ================= */

// type Tab = "Recent" | "Favourites" | "Collaboration" | "Approval";
// export type Sort = "Date" | "Time" | "Tags" | "Priority";

// const tabs: Tab[] = ["Recent", "Favourites", "Collaboration", "Approval"];

// /* ================= HELPERS ================= */

// function getToastMessage(res: unknown, fallback: string) {
//   return res?.message || res?.data?.message || fallback;
// }

// function getErrorMessage(err: unknown, fallback: string) {
//   return err?.message || fallback;
// }

/* ================= COMPONENT ================= */

const Library: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<Tab>("Recent");
  // const [sort, setSort] = useState<Sort>("Date");
  // const [openSort, setOpenSort] = useState(false);
  // const [selectedLists, setSelectedLists] = useState<string[]>([]);

  // const sortRef = React.useRef<HTMLDivElement | null>(null);
  // useOutsideClick(sortRef, () => setOpenSort(false), openSort);

  // const dispatch = useDispatch();

  // /* ================= MAIN API ================= */

  // const { data, loading, callApi, setData } =
  //   useApi<TaskType[]>("/api/library");

  // /* ================= LOAD DATA ================= */

  // useEffect(() => {
  //   callApi({
  //     method: "GET",
  //     params: {
  //       tab: activeTab,
  //       sort,
  //     },
  //   });
  // }, [activeTab, sort, callApi]);

  // /* ================= REALTIME LISTENER ================= */

  // useEffect(() => {
  //   const handler = (e: CustomEvent) => {
  //     const newList = e.detail;

  //     setData((prev) => {
  //       if (!prev || !prev.data) return prev;

  //       const lists = prev.data.lists || [];

  //       if (lists.some((item) => item.id === newList.id)) {
  //         return prev;
  //       }

  //       if (activeTab === "Favourites" && !newList.isFavourite) return prev;
  //       if (activeTab === "Collaboration" && !newList.isShared) return prev;
  //       if (activeTab === "Approval" && !newList.isPending) return prev;

  //       return {
  //         ...prev,
  //         data: {
  //           ...prev.data,
  //           lists: [newList, ...lists],
  //         },
  //       };
  //     });
  //   };

  //   window.addEventListener("new-list", handler as EventListener);

  //   return () => {
  //     window.removeEventListener("new-list", handler as EventListener);
  //   };
  // }, [setData, activeTab]);

  // /* ================= APIs ================= */

  // const { callApi: deleteTask } =
  //   useApi<{ success: boolean; message?: string; data?: unknown }>(
  //     "/api/library"
  //   );

  // const { callApi: toggleFavourite } =
  //   useApi<{ message?: string }>("/api/library/favourite");

  // const { callApi: postApproval } =
  //   useApi<{ message?: string }>("/api/library/approval");

  // /* ================= DELETE ================= */

  // const handleDeleteList = async (id?: string) => {
  //   const ids = id ? [id] : selectedLists;
  //   if (!data) return;

  //   const prev = data;

  //   setData((p) => {
  //     if (!p || !p.data) return p;

  //     return {
  //       ...p,
  //       data: {
  //         ...p.data,
  //         lists: p.data.lists.filter((item) => !ids.includes(item.id)),
  //       },
  //     };
  //   });

  //   setSelectedLists([]);

  //   try {
  //     const res = await deleteTask({
  //       method: "DELETE",
  //       body: { listId: ids },
  //     });

  //     if (!res?.success) {
  //       setData(prev);
  //       showToast(
  //         getToastMessage(res, "You are not allowed to delete this list"),
  //         "warning"
  //       );
  //       return;
  //     }

  //     showToast(
  //       getToastMessage(res, "List deleted successfully"),
  //       "success"
  //     );

  //     dispatch(fetchLists());
  //   } catch (err) {
  //     setData(prev);

  //     showToast(
  //       getErrorMessage(err, "Delete failed"),
  //       "error"
  //     );
  //   }
  // };

  // /* ================= TOGGLE FAVOURITE ================= */

  // const handleFunctionFavourite = async (id: string) => {
  //   if (!data) return;

  //   const prev = data;

  //   setData((p) => {
  //     if (!p || !p.data) return p;

  //     let updated = p.data.lists.map((item) =>
  //       item.id === id
  //         ? { ...item, isFavourite: !item.isFavourite }
  //         : item
  //     );

  //     if (activeTab === "Favourites") {
  //       updated = updated.filter((i) => i.isFavourite);
  //     }

  //     return {
  //       ...p,
  //       data: {
  //         ...p.data,
  //         lists: updated,
  //       },
  //     };
  //   });

  //   try {
  //     const res = await toggleFavourite({
  //       method: "PATCH",
  //       body: { listId: id },
  //     });

  //     showToast(
  //       getToastMessage(res, "Favourite updated"),
  //       "success"
  //     );
  //   } catch (err) {
  //     setData(prev);

  //     showToast(
  //       getErrorMessage(err, "Favourite update failed"),
  //       "error"
  //     );
  //   }
  // };

  // /* ================= APPROVAL ================= */

  // const handleFunctionApprove = async (
  //   id: string,
  //   state: boolean
  // ) => {
  //   if (!data) return;

  //   const prev = data;

  //   setData((p) => {
  //     if (!p || !p.data) return p;

  //     return {
  //       ...p,
  //       data: {
  //         ...p.data,
  //         lists: p.data.lists.map((item) =>
  //           item.id === id
  //             ? { ...item, isPending: false }
  //             : item
  //         ),
  //       },
  //     };
  //   });

  //   try {
  //     const res = await postApproval({
  //       method: "PATCH",
  //       body: { listId: id, isApproved: state },
  //     });

  //     showToast(
  //       getToastMessage(
  //         res,
  //         state ? "Approved" : "Rejected"
  //       ),
  //       state ? "success" : "warning"
  //     );

  //     callApi({
  //       method: "GET",
  //       params: { tab: activeTab, sort },
  //     });

  //     dispatch(fetchLists());
  //   } catch (err) {
  //     setData(prev);

  //     showToast(
  //       getErrorMessage(err, "Approval failed"),
  //       "error"
  //     );
  //   }
  // };





  /* ================= UI ================= */

  return (
    <div className="w-full flex flex-col py-6 h-screen">
      {/* <PageHeading title="All Lists" />

      <div className="w-full mt-6 px-6 flex items-center">
        <LibraryTabs
          tabs={tabs}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          isActiveApproval={data?.data?.hasApprovalData}
        />

        <div className="flex-1 flex justify-end gap-3">
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setOpenSort(!openSort)}
              className="px-3 h-8 rounded-full flex items-center text-[13px] gap-1 text-[#a7a7a7] hover:text-white hover:bg-[#232323]"
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
            className="px-3 h-8 rounded-full flex items-center text-[13px] gap-1 text-[#a7a7a7] hover:text-white hover:bg-[#232323]"
          >
            <Plus size={16} /> Create list
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      {/* {loading ? (
        <div className="px-8 h-full pt-6">
          {[140, 180, 120, 160, 200].map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 border-b border-white/5"
            >
              <Shimmer className="h-4 w-4" />
              <div className="flex flex-col gap-2 flex-1">
                <Shimmer className="h-3" style={{ width: w }} />
                <Shimmer className="h-2.5 opacity-60" style={{ width: w + 60 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center h-full">
          {activeTab === "Recent" && (
            <Recent
              data={data?.data?.lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
            />
          )}

          {activeTab === "Favourites" && (
            <Favourites
              data={data?.data?.lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
            />
          )}

          {activeTab === "Collaboration" && (
            <Collaboration
              data={data?.data?.lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
            />
          )}

          {activeTab === "Approval" && (
            <Approvel
              data={data?.data?.lists}
              selectedLists={selectedLists}
              setSelectedLists={setSelectedLists}
              handleDeleteList={handleDeleteList}
              handleFunctionFavourite={handleFunctionFavourite}
              handleFunctionApprove={handleFunctionApprove}
            />
          )}
        </div>
      )}  */}
    </div>
  );
};

export default Library;