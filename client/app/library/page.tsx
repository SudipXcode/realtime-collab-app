// app/library/page.tsx

import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";


export const metadata: Metadata = {
  title: "Library – TaskPilot",
  description:
    "Manage and organize all your tasks in one place.",
};

export default function Page() {
  return (
    <div className="w-full flex h-screen relative">
      <Sidebar />
    
    </div>
  );
}