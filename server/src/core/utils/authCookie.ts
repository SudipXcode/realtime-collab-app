// import { Response, CookieOptions } from "express";
// import { ENV } from "../../config/env";

// const getCookieOptions = (): CookieOptions => {
//   // const isProd = ENV.NODE_ENV === "production";

//   return {
//     httpOnly: true,
//     secure: true,
//     sameSite: "none",
//     path: "/",
//   };
// };

// export const setAuthCookies = (
//   res: Response,
//   accessToken: string,
//   refreshToken: string,
// ) => {
//   const baseOptions = getCookieOptions();

//   res.cookie("accessToken", accessToken, {
//     ...baseOptions,
//     maxAge: 15 * 60 * 1000,
//   });

//   res.cookie("refreshToken", refreshToken, {
//     ...baseOptions,
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//   });
// };

// export const clearAuthCookies = (res: Response) => {
//   const baseOptions = getCookieOptions();

//   res.clearCookie("accessToken", baseOptions);
//   res.clearCookie("refreshToken", baseOptions);
// };
import { Response, CookieOptions } from "express";

const getCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    // secure: true only in production (Railway sets NODE_ENV=production)
    secure: process.env.NODE_ENV === "production",
    // ✅ Use "lax" — since Next.js proxies /api/* to the backend,
    // the browser sees the cookie as same-origin (from your Next.js domain).
    // "none" is only needed for true cross-origin requests, which we no longer have.
    sameSite: "lax",
    path: "/",
  };
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const baseOptions = getCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes in ms
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  });
};

export const clearAuthCookies = (res: Response) => {
  const baseOptions = getCookieOptions();
  res.clearCookie("accessToken", baseOptions);
  res.clearCookie("refreshToken", baseOptions);
};