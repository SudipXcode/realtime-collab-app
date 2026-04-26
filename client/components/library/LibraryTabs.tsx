import React from "react";

// ✅ Reuse your Tab type (or define here if not imported)
type Tab = "Recent" | "Favourites" | "Collaboration" | "Approval";

// ✅ Props type
type LibraryTabsProps = {
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  hasPending: boolean
};

const LibraryTabs: React.FC<LibraryTabsProps> = ({
  tabs,
  setActiveTab,
  activeTab,
  hasPending
}): JSX.Element => {


  return (
    <div className="flex-1 flex gap-2 items-center">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-3 h-8 rounded-full relative text-[13px] font-medium transition ease-in duration-150
            ${activeTab === tab
              ? "bg-[#2D2D2D] text-white"
              : "text-[#a7a7a7] hover:bg-[#232323]"
            }`}
        >
          {tab}

          {tab === "Approval" && hasPending && (
            <div className="w-3 h-3 flex items-center justify-center bg-[#232323] absolute -right-1 top-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A33]" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default LibraryTabs;