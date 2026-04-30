import { fetchWithAuth } from "../lib/fetchWithAuth";

import { notFound } from "next/navigation";
import { cache } from "react";

export const getList = cache(async (id: string): Promise<any> => {
  const { data, status } = await fetchWithAuth<any>(
    `/api/lists/${id}`,
  );

  if (status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!data || !data.data) {
    notFound(); // ✅ triggers Next.js not-found page
  }

  return data.data;
});
