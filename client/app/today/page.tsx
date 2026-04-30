import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import ListNav from "@/components/layout/ListNav";
import Details from "@/components/lists/Details/Details";
import TodayTasks from '@/components/today/TodayTasks'
import { getTodayList } from "@/hooks/getTodayList";


export const metadata: Metadata = {
  title: "Today – TaskPilot",
  description:
    "Manage and organize all your tasks in one place.",
};

export default async function Page() {
  const Todaylist = await getTodayList();

  return (
    <div className="w-full flex h-screen relative">
      <Sidebar />
      <ListNav />
      <TodayTasks initialData={Todaylist} />
      <Details />
    </div>
  );
}