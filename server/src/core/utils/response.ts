

// export const successResponse = <T>(
//   data: T,
//   message = "Success",
//   statusCode = 200,
//   meta?: Record<string, unknown>
// ) => ({
//   success: true,
//   message,
//   statusCode,
//   data,
//   meta: meta ?? null,
// });

// export const errorResponse = (
//   message: string,
//   statusCode = 500,
//   errorCode?: string,
//   details?: unknown
// ) => ({
//   success: false,
//   message,
//   statusCode,
//   errorCode: errorCode ?? null,
//   details: details ?? null,
// });

/* ================= SUCCESS ================= */

export const successResponse = <T>(
  data: T,
  message = "Success",
  meta?: Record<string, unknown>
) => ({
  success: true,
  message,
  data,
  ...(meta ? { meta } : {}),
});

export const errorResponse = (
  code: string,
  message: string,
  details?: unknown
) => ({
  success: false,
  code,
  message,
  ...(details !== undefined ? { details } : {}),
});