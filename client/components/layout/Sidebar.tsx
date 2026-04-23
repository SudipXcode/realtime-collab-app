"use client";

import {
  Bell,
  CalendarDays,
  CircleHelp,
  RefreshCw,
  Search,
  SquareCheckBig,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { usePath } from "@/hooks/usePathname";
import Link from "next/link";
import ProfileOptions from "../ui/ProfileOptions";
import { useOutsideClick } from "@/hooks/useOutSideclick";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";


const TASK_PATH_PATTERNS: RegExp[] = [
  /^\/completed$/,
  /^\/inbox$/,
  /^\/library$/,
  /^\/upcoming$/,
  /^\/today$/,
  /^\/trash$/,
  /^\/inbox\/[^/]+$/,
];

const Sidebar: React.FC = () => {
  const { user, isLoading } = useUser();
  const path = usePath();


  const [openProfileOptions, setOpenProfileOptions] = useState(false);
  const profileOptionRef = useRef<HTMLDivElement>(null);
  useOutsideClick(profileOptionRef, () => setOpenProfileOptions(false), openProfileOptions);

  const isTaskPath = TASK_PATH_PATTERNS.some((pattern) =>
    pattern.test(path)
  );

  const [syncing, setSyncing] = useState(false);

  /* ================= GLOBAL LOADING LISTENER ================= */

  useEffect(() => {
    const handler = (e: CustomEvent<number>) => {
      const count = e.detail;

      if (count === 0) {
        setSyncing(false);
      }
    };

    window.addEventListener("api-loading", handler as EventListener);

    return () => {
      window.removeEventListener("api-loading", handler as EventListener);
    };
  }, []);

  /* ================= SYNC HANDLER ================= */

  const handleSync = async () => {
    try {
      setSyncing(true);

      // // ✅ ensure proper await
      // await dispatch(fetchLists()).unwrap();

      // // optional global refresh event
      // window.dispatchEvent(new Event("refresh"));
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false); // 🔒 always stop spinner
    }
  };

  return (
    <div className="w-12 flex-none h-full flex flex-col justify-between items-center bg-[#232323] border-r border-[#2D2D2D]">

      {/* Profile */}
      <div ref={profileOptionRef} className="w-full relative py-3">
        <div
          title="Account"
          onClick={() => setOpenProfileOptions((prev) => !prev)}
          className="w-7.5 mx-auto h-7.5 cursor-pointer relative rounded-full"
        >
          {isLoading ? (
            <div className="w-full h-full rounded-full bg-gray-700 animate-pulse" />
          ) : user?.image ? (
            <Image
              width={100}
              height={100}
              alt="avatar"
              src={user.image}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-800" />
          )}
        </div>

        {openProfileOptions && (
          <ProfileOptions user={user} setOpenProfileOptions={setOpenProfileOptions} />
        )}
      </div>

      {/* Main Nav */}
      <div className="w-full pt-2 h-full  flex flex-col gap-5 items-center">
        <Link href="/library">
          <button
            title="Workspace"
            className={`${isTaskPath ? "text-white" : "text-[#7C7C7C] hover:text-white"
              }`}
          >
            <SquareCheckBig size={22} />
          </button>
        </Link>

        <button className="text-[#7C7C7C] hover:text-white">
          <CalendarDays size={22} />
        </button>

        <Link href="/search">
          <button
            title="Search"
            // onClick={() => dispatch(setSelectedTask())}
            className={`${path === "/search"
              ? "text-white"
              : "text-[#7C7C7C] hover:text-white"
              }`}
          >
            <Search size={22} />
          </button>
        </Link>
      </div>

      {/* Bottom Nav */}
      <div className="w-full flex flex-col items-center py-6 gap-5">
        <button
          onClick={handleSync}
          title="Sync"
          className="text-[#7C7C7C] hover:text-white"
        >
          <RefreshCw
            size={22}
            className={syncing ? "animate-spin" : ""}
          />
        </button>

        <button className="text-[#7C7C7C] hover:text-white">
          <Bell size={22} />
        </button>

        <button className="text-[#7C7C7C] hover:text-white">
          <CircleHelp size={22} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;