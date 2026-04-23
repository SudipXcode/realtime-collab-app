// "use client";

// import { useState, useCallback, useEffect } from "react";
// import { apiCall, ApiOptions } from "@/lib/apiCall";

// interface UseApiReturn<T> {
//   data: T | null;
//   error: string | null;
//   loading: boolean;
//   callApi: (options?: ApiOptions) => Promise<T | undefined>;
// }

// export function useApi<T = unknown>(
//   endpoint: string,
//   config?: {
//     autoRefresh?: boolean;
//     showErrorToast?: boolean;
//     defaultOptions?: ApiOptions; // 🔥 IMPORTANT
//   },
// ): UseApiReturn<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);


//   const callApi = useCallback(
//     async (
//       options?: ApiOptions & { silent?: boolean; path?: string }, // ✅ add path
//     ): Promise<T | undefined> => {
//       setLoading(true);
//       setError(null);

//       try {
//         const finalUrl = options?.path
//           ? `${endpoint}${options.path}` // ✅ dynamic params
//           : endpoint;

//         const result = await apiCall<T>(finalUrl, {
//           ...config?.defaultOptions,
//           ...options,
//         });

//         setData(result);
//         return result;
//       } catch (err: unknown) {
//         const message = err?.message || "Something went wrong";

//         setError(message);

//         if (!options?.silent && config?.showErrorToast !== false) {
//           // showToast(message, "error");
//         }

//         return undefined;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [endpoint, config?.defaultOptions, config?.showErrorToast],
//   );

//   // 🔥 GLOBAL REFRESH
//   useEffect(() => {
//     if (!config?.autoRefresh) return;

//     const handleRefresh = () => {
//       callApi(); // uses defaultOptions
//     };

//     window.addEventListener("refresh", handleRefresh);

//     return () => {
//       window.removeEventListener("refresh", handleRefresh);
//     };
//   }, [callApi, config?.autoRefresh]);

//   return { data, error, loading, callApi, setData }; // ✅ add this
// }

"use client";

import { useState, useCallback, useEffect } from "react";
import { apiCall, ApiOptions } from "@/lib/apiCall";

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  callApi: (options?: ApiOptions & { silent?: boolean; path?: string }) => Promise<T | undefined>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApi<T = unknown>(
  endpoint: string,
  config?: {
    autoRefresh?: boolean;
    showErrorToast?: boolean;
    defaultOptions?: ApiOptions;
  }
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callApi = useCallback(
    async (
      options?: ApiOptions & { silent?: boolean; path?: string }
    ): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const finalUrl = options?.path
          ? `${endpoint}${options.path}`
          : endpoint;

        const result = await apiCall<T>(finalUrl, {
          ...config?.defaultOptions,
          ...options,
        });

        setData(result);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        setError(message);

        // ✅ ONLY PLACE TO SHOW TOAST
        if (!options?.silent && config?.showErrorToast !== false) {
          // showToast(message, "error");
        }

        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, config?.defaultOptions, config?.showErrorToast]
  );

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    if (!config?.autoRefresh) return;

    const handleRefresh = () => {
      callApi();
    };

    window.addEventListener("refresh", handleRefresh);

    return () => {
      window.removeEventListener("refresh", handleRefresh);
    };
  }, [callApi, config?.autoRefresh]);

  return {
    data,
    error,
    loading,
    callApi,
    setData,
  };
}