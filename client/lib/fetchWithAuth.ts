
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export type FetchResult<T> = {
  data: T | null;
  newCookies: string | null;
  status: number;
};

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<FetchResult<T>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // 1️⃣ Make initial request with current cookies
  let res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  });

  // 2️⃣ If 401 → refresh and retry once
  if (res.status === 401) {
    console.log("🔄 Got 401, attempting refresh...");
    
    const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
    });

    if (!refreshRes.ok) {
      console.error("❌ Refresh failed");
      return { data: null, newCookies: null, status: 401 };
    }

    const newCookies = refreshRes.headers.get("set-cookie");

    // 3️⃣ Retry original request with new tokens
    res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: newCookies || cookieHeader,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ Retry failed with ${res.status}`);
      return { data: null, newCookies, status: res.status };
    }

    const data: T = await res.json();
    return { data, newCookies, status: res.status };
  }

  // 4️⃣ Success on first try
  if (!res.ok) {
    return { data: null, newCookies: null, status: res.status };
  }

  const data: T = await res.json();
  return { data, newCookies: null, status: res.status };
}