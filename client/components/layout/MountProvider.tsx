"use client";

import React from "react";
import Loading from "../../app/loading";

export default function MountedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return <Loading />;

  return <>{children}</>;
}