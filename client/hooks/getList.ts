import { fetchWithAuth } from "../lib/fetchWithAuth";
import { List } from "@/app/api/lists/[id]/route";
import { notFound } from "next/navigation";
import { cache } from "react";
type ListApiResponse = {
  success: boolean;
  message: string;
  data: List | null;
};

export const getList = cache(async (id: string): Promise<List> => {
  const { data, status } = await fetchWithAuth<ListApiResponse>(
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
