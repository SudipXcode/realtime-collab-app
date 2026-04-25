// export const formatDate = (isoString: string) => {
//   const hasTime = isoString.includes("T") || isoString.includes(" ");
//   const date = new Date(isoString);
//   const now = new Date();

//   const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//   const diffDays = Math.round(
//     (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
//   );

//   // --- Date-only (no time component) ---
//   if (!hasTime) {
//     if (diffDays === 0) return "Today";
//     if (diffDays === 1) return "Yesterday";
//     if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
//     if (diffDays < 0) {
//       const absDiff = Math.abs(diffDays);
//       if (absDiff === 1) return "Tomorrow";
//       if (absDiff < 7) return `In ${absDiff} days`;
//     }
//     return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
//   }

//   // --- DateTime (has time component) ---
//   const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   if (diffDays === 0) return `Today at ${timeStr}`;
//   if (diffDays === 1) return `Yesterday at ${timeStr}`;
//   if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago at ${timeStr}`;
//   if (diffDays < 0) {
//     const absDiff = Math.abs(diffDays);
//     if (absDiff === 1) return `Tomorrow at ${timeStr}`;
//     if (absDiff < 7) return `In ${absDiff} days at ${timeStr}`;
//   }
//   return `${date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at ${timeStr}`;
// };

export const formatDate = (isoString?: string) => {
  // ✅ FIX: handle undefined / null
  if (!isoString) return "Unknown date";

  const hasTime =
    typeof isoString === "string" &&
    (isoString.includes("T") || isoString.includes(" "));

  const date = new Date(isoString);

  // ✅ Optional: invalid date check
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // --- Date-only ---
  if (!hasTime) {
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 0) {
      const absDiff = Math.abs(diffDays);
      if (absDiff === 1) return "Tomorrow";
      if (absDiff < 7) return `In ${absDiff} days`;
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // --- DateTime ---
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Yesterday at ${timeStr}`;
  if (diffDays > 1 && diffDays < 7)
    return `${diffDays} days ago at ${timeStr}`;
  if (diffDays < 0) {
    const absDiff = Math.abs(diffDays);
    if (absDiff === 1) return `Tomorrow at ${timeStr}`;
    if (absDiff < 7) return `In ${absDiff} days at ${timeStr}`;
  }

  return `${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${timeStr}`;
};