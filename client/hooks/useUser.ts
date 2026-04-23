"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/apiCall";
import { showToast } from "@/lib/toast";

export interface User {
  id?: string;
  name: string;
  image: string;
  email?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

/* ================= SAFE CACHE (display-only, no PII) ================= */

interface SafeUserCache {
  name: string;
  image: string;
}

const USER_KEY = ["user"];
const USER_CACHE_KEY = "user_display_cache";

function saveUserCache(user: User) {
  try {
    // ✅ only persist display data — no id, no email
    const safe: SafeUserCache = {
      name: user.name ?? "",
      image: user.image ?? "",
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(safe));
  } catch {}
}

function loadUserCache(): User | undefined {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) return undefined;

    const parsed = JSON.parse(cached);

    // ✅ validate shape before trusting it
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.name !== "string" ||
      typeof parsed.image !== "string"
    ) {
      localStorage.removeItem(USER_CACHE_KEY);
      return undefined;
    }

    // ✅ sanitize strings — strip any injected HTML/script tags
    const safe: User = {
      name: parsed.name.replace(/<[^>]*>/g, "").slice(0, 200),
      image: isValidImageUrl(parsed.image) ? parsed.image : "",
    };

    return safe;
  } catch {
    localStorage.removeItem(USER_CACHE_KEY); // ✅ wipe corrupted cache
    return undefined;
  }
}

// ✅ only allow known image origins — block javascript: data: blob: etc.
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname.endsWith(host))
    );
  } catch {
    return false;
  }
}

const ALLOWED_IMAGE_HOSTS = [
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "res.cloudinary.com",
  "graph.facebook.com", // ✅ ADD THIS
];  

export function clearUserCache() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

/* ================= HOOK ================= */

export function useUser(enabled: boolean) {
  const queryClient = useQueryClient();

  /* ================= GET USER ================= */

const {
  data: user,
  isLoading,
  isFetching,
  refetch,
} = useQuery({
  queryKey: USER_KEY,
  queryFn: async () => {
    try {
      const res = await apiCall<ApiResponse<User & { picture: string }>>(
        "/api/profile",
        { method: "GET" }
      );
      const user: User = { ...res.data, image: res.data.picture };
      saveUserCache(user);
      return user;
    } catch (err: unknown) {
      if (!(err as unknown)?.blocked) {
        showToast(
          (err as unknown)?.message || "Failed to fetch user",
          "error"
        );
      }
      throw err;
    }
  },

  enabled, // 🔥🔥🔥 THIS LINE FIXES AUTO CALL

  initialData: loadUserCache,
  initialDataUpdatedAt: 0,
  staleTime: 1000 * 60 * 5,
  retry: 1,
  refetchOnWindowFocus: false,
});

  /* ================= UPDATE PROFILE ================= */

  const { mutateAsync: updateProfile, isPending: updating } = useMutation({
    mutationFn: async (data: Partial<User> | FormData) => {
      const res = await apiCall<ApiResponse<User & { picture: string }>>(
        "/api/profile",
        {
          method: "PATCH",
          body: data,
        
        },
      );
      return { ...res.data, image: res.data.picture };
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_KEY, (prev: User | undefined) => {
        const merged = prev ? { ...prev, ...updatedUser } : updatedUser;
        saveUserCache(merged);
        return merged;
      });
      showToast("Profile updated", "success");
    },

    onError: (err: unknown) => {
      if (!(err as unknown)?.blocked) {
        showToast(
          (err as unknown)?.message || "Failed to update profile",
          "error",
        );
      }
    },
  });

  /* ================= RETURN ================= */

  return {
    user,
    isLoading,
    isFetching,
    updateProfile,
    updating,
    refetchUser: refetch,
  };
}
