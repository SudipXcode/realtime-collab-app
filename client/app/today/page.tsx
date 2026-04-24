import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import ListNav from "@/components/layout/ListNav";



export const metadata: Metadata = {
  title: "Today – TaskPilot",
  description:
    "Manage and organize all your tasks in one place.",
};

export default function Page() {
  return (
    <div className="w-full flex h-screen relative">
      <Sidebar />
      <ListNav />
    
    </div>
  );
}