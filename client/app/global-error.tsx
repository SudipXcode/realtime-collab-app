"use client";

export default function GlobalError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h2 className="text-[16px] font-medium">
            Something went seriously wrong
          </h2>
          <button
            onClick={reset}
            className="text-sm text-blue-500"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}