

// import { api } from "./axios";
// import { AxiosError } from "axios";

// export type ApiOptions = {
//   method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
//   body?: unknown;
//   params?: Record<string, unknown>;
//   headers?: Record<string, string>;
// };

// export interface ApiError extends Error {
//   status?: number;
//   code?: string;
// }

// export const apiCall = async <T>(
//   endpoint: string,
//   options: ApiOptions = {}
// ): Promise<T> => {
//   try {
//     const response = await api({
//       url: endpoint,
//       method: options.method ?? "GET",
//       data: options.body,
//       params: options.params,
//       headers: options.headers,
//     });

//     return response.data;
//   } catch (error) {
//     const err = error as AxiosError<unknown>;

//     const message =
//       err.response?.data?.message ||
//       err.message ||
//       "Something went wrong";

//     const apiError: ApiError = new Error(message);
//     apiError.status = err.response?.status;
//     apiError.code = err.response?.data?.code;

//     throw apiError;
//   }
// };

import { api } from "./axios";
import { AxiosError } from "axios";

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
};

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

type BackendError = {
  message?: string;
  code?: string;
};

export const apiCall = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  try {
    const response = await api({
      url: endpoint,
      method: options.method ?? "GET",
      data: options.body,
      params: options.params,
      headers: options.headers,
    });

    return response.data;
  } catch (error) {
    const err = error as AxiosError<BackendError>;

    const message =
      err.response?.data?.message ??
      err.message ??
      "Something went wrong";

    const apiError: ApiError = new Error(message);

    apiError.status = err.response?.status;
    apiError.code = err.response?.data?.code;

    throw apiError;
  }
};