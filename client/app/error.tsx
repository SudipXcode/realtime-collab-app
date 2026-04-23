"use client";

import React from "react";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [checking, setChecking] = React.useState(false);
  const [statusText, setStatusText] = React.useState(
    "Server is down. Trying to reconnect..."
  );

  const checkServer = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/health`,
        {
          cache: "no-store",
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!res.ok) return false;

      const data = await res.json().catch(() => null);
      return data?.status === "ok";
    } catch {
      return false;
    }
  };

  React.useEffect(() => {
    const interval = setInterval(async () => {
      const isAlive = await checkServer();

      if (isAlive) {
        setStatusText("Reconnected! Reloading...");

        setTimeout(() => {
          reset(); // ✅ better than reload
        }, 1500);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [reset]);

  const handleRetry = async () => {
    setChecking(true);

    const isAlive = await checkServer();

    if (isAlive) {
      reset(); // ✅ preferred
    } else {
      console.log("Server still down");
      setStatusText("Still down. Please try again...");
    }

    setChecking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-[24px] font-bold text-red-600">
        Server Error 😢
      </h1>

      <p className="mt-2 text-[#9191a0] font-medium text-center">
        {statusText}
      </p>

      <div className="mt-4 w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />

      <button
        onClick={handleRetry}
        disabled={checking}
        className="mt-6 px-5 h-9 text-[14px] font-medium bg-gray-600 text-white rounded-full disabled:opacity-50"
      >
        {checking ? "Checking..." : "Try Again"}
      </button>
    </div>
  );
}