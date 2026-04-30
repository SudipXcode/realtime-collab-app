
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/apiCall";

/* ================= TYPES ================= */

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  isPro?: boolean;
  providers?: string[];
}

/* ================= CONST ================= */

const USER_KEY = ["user"];
const CACHE_KEY = "user_cache";

/* ================= CACHE ================= */

function saveCache(user: User) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        name: user.name,
        email: user.email,
        image: user.image,
      }),
    );
  } catch {}
}

function loadCache(): User | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    return {
      id: "",
      name: parsed.name || "",
      email: parsed.email || "",
      image: parsed.image || "",
      isPro: undefined,
      providers: undefined,
    };
  } catch {
    return;
  }
}

/* ================= HOOK ================= */

export function useUser(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: USER_KEY,

    queryFn: async () => {
      const res = await apiCall<any>("/api/profile");

      const user: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        image: res.data.picture,
        isPro: res.data.isPro,
        providers: res.data.providers,
      };

      saveCache(user);
      return user;
    },

    enabled,
    initialData: loadCache,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* ================= UPDATE PROFILE ================= */

  const { mutateAsync: updateProfile, isPending: updating } = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiCall<any>("/api/profile", {
        method: "PATCH",
        body: data,
      });
    },

    onSuccess: (res: any) => {
      const updated: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        image: res.data.picture,
        isPro: res.data.isPro,
        providers: res.data.providers,
      };

      queryClient.setQueryData(USER_KEY, updated);
      saveCache(updated);
    },
  });

  return {
    user,
    isLoading,
    updateProfile,
    updating,
    refetch, // ✅ IMPORTANT FIX
  };
}
