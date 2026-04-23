// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data?: T;
//   statusCode: number;
//   meta?: Record<string, unknown>;
// }

export const successResponse = <T>(
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>
) => ({
  success: true,
  message,
  statusCode,
  data,
  meta: meta ?? null,
});

export const errorResponse = (
  message: string,
  statusCode = 500,
  errorCode?: string,
  details?: unknown
) => ({
  success: false,
  message,
  statusCode,
  errorCode: errorCode ?? null,
  details: details ?? null,
});