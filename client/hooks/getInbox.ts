import { fetchWithAuth } from "../lib/fetchWithAuth";
import { notFound } from "next/navigation";
import { cache } from "react";

export const getInboxList = cache(async (): Promise<any> => {
  const { data, status } =
    await fetchWithAuth<any>(`/api/task/inbox`);

  if (status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!data || !data.data) {
    notFound(); // ✅ triggers Next.js not-found page
  }

  return data.data;
});
