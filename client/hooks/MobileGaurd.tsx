"use client";

import { useEffect, useState } from "react";

export default function MobileGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      setAllowed(window.innerWidth >= 1280);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent hydration flash
  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-center text-[#9191a0] font-medium text-[15px]">
          Not supported on small screens. Please use a larger display.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
