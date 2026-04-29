import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import Search from "@/components/search/Search";
import Details from "@/components/lists/Details/Details";



export const metadata: Metadata = {
  title: "Search – TaskPilot",
  description:
    "Manage and organize all your tasks in one place.",
};

export default function Page() {
  return (
    <div className="w-full flex h-screen relative">
      <Sidebar />
      <Search />
      <Details />
    </div>
  );
}