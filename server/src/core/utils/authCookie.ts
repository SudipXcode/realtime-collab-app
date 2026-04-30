
import { Response, CookieOptions } from "express";
import { ENV } from "../../config/env";

const getCookieOptions = (): CookieOptions => {
  const isProd = ENV.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
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
    maxAge: ENV.ACCESS_TOKEN_COOKIE_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    maxAge: ENV.REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

export const clearAuthCookies = (res: Response) => {
  const baseOptions = getCookieOptions();

  res.clearCookie("accessToken", baseOptions);
  res.clearCookie("refreshToken", baseOptions);
};