"use client";

import { useState, useCallback, useEffect } from "react";
import { apiCall, ApiOptions } from "@/lib/apiCall";

/* ============================= */
/* TYPES                        */
/* ============================= */

type ApiInput =
  | FormData
  | (ApiOptions & {
      silent?: boolean;
      path?: string;
    })
  | unknown;

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  callApi: (input?: ApiInput) => Promise<T | undefined>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/* ============================= */
/* HOOK                         */
/* ============================= */

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

  const autoRefresh = config?.autoRefresh;
  const showErrorToast = config?.showErrorToast;
  const defaultOptions = config?.defaultOptions;

  const callApi = useCallback(
    async (input?: ApiInput): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        let finalOptions: ApiOptions & {
          silent?: boolean;
          path?: string;
        } = {
          ...defaultOptions,
        };

        /* ============================= */
        /* HANDLE INPUT                 */
        /* ============================= */

        if (input instanceof FormData) {
          finalOptions.body = input;
        } else if (
          input &&
          typeof input === "object" &&
          !Array.isArray(input)
        ) {
          const maybeOptions = input as ApiOptions & {
            silent?: boolean;
            path?: string;
          };

          finalOptions = {
            ...finalOptions,
            ...maybeOptions,
          };
        } else if (input !== undefined) {
          finalOptions.body = input;
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
          input &&
          typeof input === "object" &&
          "silent" in input &&
          (input as { silent?: boolean }).silent;

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

  /* ============================= */
  /* AUTO REFRESH                */
  /* ============================= */

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