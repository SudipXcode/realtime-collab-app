"use client";

import { useState, useCallback, useEffect } from "react";
import { apiCall, ApiOptions } from "@/lib/apiCall";

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  callApi: (
    input?: unknown | (ApiOptions & { silent?: boolean; path?: string })
  ) => Promise<T | undefined>;
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
  /* ✅ MISSING STATE (FIXED) */
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const autoRefresh = config?.autoRefresh;
  const showErrorToast = config?.showErrorToast;
  const defaultOptions = config?.defaultOptions;

  const callApi = useCallback(
    async (
      input?: unknown | (ApiOptions & { silent?: boolean; path?: string })
    ): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        let finalOptions: ApiOptions & {
          silent?: boolean;
          path?: string;
        } = {};

        if (input instanceof FormData) {
          finalOptions = {
            ...defaultOptions,
            body: input,
          };
        } else if (
          typeof input === "object" &&
          input !== null &&
          ("method" in input || "body" in input || "params" in input)
        ) {
          finalOptions = {
            ...defaultOptions,
            ...input,
          };
        } else {
          finalOptions = {
            ...defaultOptions,
            body: input,
          };
        }

        const finalUrl = finalOptions.path
          ? `${endpoint}${finalOptions.path}`
          : endpoint;

        const result = await apiCall<T>(finalUrl, finalOptions);

        setData(result);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        setError(message);

        const isSilent =
          typeof input === "object" &&
          input !== null &&
          "silent" in input &&
          (input as unknown).silent;

        if (!isSilent && showErrorToast !== false) {
          // showToast(message, "error");
        }

        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, defaultOptions, showErrorToast]
  );

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    if (!autoRefresh) return;

    const handleRefresh = () => {
      callApi();
    };

    window.addEventListener("refresh", handleRefresh);

    return () => {
      window.removeEventListener("refresh", handleRefresh);
    };
  }, [callApi, autoRefresh]);

  return {
    data,
    error,
    loading,
    callApi,
    setData,
  };
}