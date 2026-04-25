import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import ListNav from "@/components/layout/ListNav";



export const metadata: Metadata = {
    title: "Taskpilot-AI – TaskPilot",
    description:
        "Manage and organize all your tasks in one place.",
};

export default function Page() {
    return (
        <div className="w-full flex h-screen relative">
            <Sidebar />
            <ListNav />
            <div className="w-full h-screen flex items-center justify-center relative">
                <div className="flex flex-col items-center gap-4 text-center px-6">

                    {/* Icon */}
                    <div className="p-4 text-3xl">
                        🤖
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-white">
                        AI Features Coming Soon
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-[#7C7C7C] max-w-sm">
                        Smart task suggestions, auto-planning, and AI-powered productivity tools
                        are on the way.
                    </p>

                    {/* Optional badge */}
                    <span className="text-[11px]  text-[#FF8A33] ">
                        In Development
                    </span>
                </div>
            </div>
        </div>
    );
}