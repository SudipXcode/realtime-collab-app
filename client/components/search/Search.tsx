"use client";

import React, { useEffect, useState } from "react";
import SearchHeading from "./SearchHeading";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { showToast } from "@/lib/toast";
import { FolderSearch } from "lucide-react";
import List from "./List";

/* ================= HELPERS ================= */

function getErrorMessage(err: unknown, fallback: string) {
    return err?.message || fallback;
}

/* ================= MAIN ================= */

const Search = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 700);

    const { data, loading, error, callApi } =
        useApi<SearchApiResponse>("/api/search/");

    /* ================= API CALL ================= */

    useEffect(() => {
        if (!debouncedQuery.trim()) return;

        callApi({
            method: "GET",
            params: { query: debouncedQuery },
            silent: true,
        }).catch(() => { });
    }, [debouncedQuery, callApi]);

    /* ================= ERROR TOAST ================= */

    useEffect(() => {
        if (!error || !debouncedQuery.trim()) return;

        showToast(
            getErrorMessage(error, "Search failed"),
            "error"
        );
    }, [error, debouncedQuery]);

    function Shimmer({
        className,
        style,
    }: {
        className?: string;
        style?: React.CSSProperties;
    }) {
        return (
            <div
                style={style}
                className={`relative overflow-hidden rounded bg-white/5 ${className}`}
            />
        );
    }

    return (
        <div className="w-full flex flex-col py-6 h-screen">
            <SearchHeading value={query} onChange={setQuery} />

            {loading && debouncedQuery.trim() ? (
                <div className="px-8 h-full pt-4">
                    {[140, 180, 120, 160, 200].map((w, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-2 border-b border-white/5"
                        >
                            <Shimmer className="h-4 w-4 rounded shrink-0" />
                            <div className="flex flex-col gap-2 flex-1">
                                <Shimmer
                                    className="h-3 rounded"
                                    style={{ width: w }}
                                />
                                <Shimmer
                                    className="h-2.5 rounded opacity-60"
                                    style={{ width: w + 60 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : !data?.data?.length ? (
                <div className="px-10 pt-6 flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#2F2F2F] rounded-lg rotate-45">
                        <FolderSearch
                            className="text-[#7C7C7C] -rotate-45"
                            size={20}
                        />
                    </div>

                    <h5 className="text-[14px] text-[#7C7C7C] font-medium">
                        You don’t have any search result yet!
                    </h5>
                </div>
            ) : (
                <div className="px-4 w-full h-auto pt-4">
                    {data.data.map((item) => (
                        <List
                            key={item.id}
                            i={item}
                            query={query}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;