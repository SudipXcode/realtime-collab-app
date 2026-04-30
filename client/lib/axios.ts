import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getDeviceId } from "./deviceId";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://realtime-collab-app-production.up.railway.app";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* ================= REQUEST ================= */

let isRefreshing = false;
let subscribers: ((success: boolean) => void)[] = [];

function subscribe(cb: (success: boolean) => void) {
  subscribers.push(cb);
}

function notifySubscribers(success: boolean) {
  subscribers.forEach((cb) => cb(success));
  subscribers = [];
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const deviceId = getDeviceId();
  if (deviceId) config.headers["x-device-id"] = deviceId;

  // ⏳ Wait if refresh is running
  if (isRefreshing) {
    await new Promise((resolve) => {
      subscribe(() => resolve(true)); // always resolve (no crash)
    });
  }

  return config;
});

/* ================= RESPONSE ================= */

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) {
      console.error("❌ Network error:", error);

      return Promise.reject(error);
    }

    const status = error.response.status as any;
  const code = (error.response.data as any)?.code;

    // =============================
    // ✅ IF REFRESH IN PROGRESS → WAIT
    // =============================
    if (status === 401 && isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((success) => {
          if (success) {
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // =============================
    // ✅ START REFRESH FLOW
    // =============================
    if (
      status === 401 &&
      !originalRequest._retry &&
      ["ACCESS_TOKEN_EXPIRED", "ACCESS_TOKEN_MISSING"].includes(code)
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        isRefreshing = false;
        notifySubscribers(true);

        return api(originalRequest); // 🔁 retry
      } catch (refreshError) {
        isRefreshing = false;
        notifySubscribers(false);

        window.location.href = "/"; // logout
        return Promise.reject(refreshError);
      }
    }

    // =============================
    // ❌ OTHER ERRORS
    // =============================
    error.message =
      (error.response.data as any)?.message || error.message || "Something went wrong";

    return Promise.reject(error);
  },
);

/* ================= INIT AUTH (VERY IMPORTANT) ================= */

let hasInitialized = false;

export const initAuth = async () => {
  if (hasInitialized) return;

  try {
    await api.post("/api/auth/refresh");
  } catch {
    // ignore (user may not be logged in)
  } finally {
    hasInitialized = true;
  }
};
