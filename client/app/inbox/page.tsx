import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import ListNav from "@/components/layout/ListNav";
import Details from "@/components/lists/Details/Details";
import InboxTasks from "@/components/inbox/InboxTasks";



export const metadata: Metadata = {
  title: "Inbox – TaskPilot",
  description:
    "Manage and organize all your tasks in one place.",
};

export default function Page() {
  return (
    <div className="w-full flex h-screen relative">
      <Sidebar />
      <ListNav />
      <InboxTasks />
      <Details
      // list={list}
      // id={id}
      />
    </div>
  );
}