"use client";

import React, { useEffect, useMemo, useState } from "react";
import SearchHeading from "./SearchHeading";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useDispatch } from "react-redux";

import { showToast } from "@/lib/toast";
import AllTasks from "./AllTasks";

/* ================= HELPERS ================= */

function getErrorMessage(err: unknown, fallback: string) {
    return err?.message || fallback;
}

/* ================= MAIN ================= */

const Search = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 700);

    const { data, loading, error, callApi } =
        useApi<SearchApiResponse>("/api/search/lists");

    const dispatch = useDispatch();

    /* ================= API CALL ================= */

    useEffect(() => {
        if (!debouncedQuery.trim()) return;

        callApi({
            method: "GET",
            params: { query: debouncedQuery },
            silent: true, // we handle toast manually
        }).catch(() => {
            // optional: handled in error effect
        });
    }, [debouncedQuery, callApi]);

    /* ================= ERROR TOAST ================= */

    useEffect(() => {
        if (!error) return;

        // avoid showing toast when user clears input
        if (!debouncedQuery.trim()) return;

        showToast(
            getErrorMessage(error, "Search failed"),
            "error"
        );
    }, [error, debouncedQuery]);

    /* ================= MERGE TASKS INTO STORE ================= */

    useEffect(() => {
        if (!data?.data?.tasks) return;

        dispatch(mergeTasks(data.data.tasks));
    }, [data, dispatch]);

    /* ================= RESULTS ================= */

    const results = useMemo<SearchResult[]>(() => {
        if (!debouncedQuery.trim()) return [];

        const tasks = data?.data?.tasks ?? [];
        const lists = data?.data?.lists ?? [];

        return [...tasks, ...lists].sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }, [data, debouncedQuery]);

    /* ================= SHIMMER ================= */

    function Shimmer({ className }: { className?: string }) {
        return (
            <div
                className={`relative overflow-hidden rounded bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`}
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
                                <Shimmer className="h-3 rounded" style={{ width: w }} />
                                <Shimmer
                                    className="h-2.5 rounded opacity-60"
                                    style={{ width: w + 60 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <AllTasks
                    data={results.length ? results : null}
                    error={error}
                    query={query}
                />
            )}
        </div>
    )
}

export default Search
