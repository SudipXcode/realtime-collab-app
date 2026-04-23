
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const BACKEND_URL = process.env.BACKEND_URL!;
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);
const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);

// 🔒 shared cookie config
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// 🔁 refresh deduplication (prevents race condition)
let refreshPromise: Promise<unknown> | null = null;

// ✅ Soft verification (DO NOT TRUST FULLY)
async function isValid(token: string, secret: Uint8Array) {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// ✅ Refresh call (clean JSON contract)
async function refreshTokens(refreshToken: string) {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Refresh failed");
        return res.json();
      })
      .finally(() => {
        refreshPromise = null; // reset after completion
      });
  }

  return refreshPromise;
}

// ❌ clear cookies helper
function clearCookies(res: NextResponse) {
  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");
}

// 🚀 MAIN PROXY
export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const hasRefresh = !!refreshToken;
  const isRefreshValid = hasRefresh
    ? await isValid(refreshToken!, REFRESH_SECRET)
    : false;

  const isAccessValid = accessToken
    ? await isValid(accessToken, ACCESS_SECRET)
    : false;

  // ❌ No refresh → only allow "/"
  if (!isRefreshValid) {
    if (pathname === "/") return NextResponse.next();

    url.pathname = "/";
    const res = NextResponse.redirect(url);
    clearCookies(res);
    return res;
  }

  // ✅ Logged in → block login page
  if (pathname === "/") {
    url.pathname = "/library";
    return NextResponse.redirect(url);
  }

  // 🔄 Access expired → refresh safely (deduplicated)
  if (!isAccessValid) {
    try {
      const data = await refreshTokens(refreshToken!);

      const res = NextResponse.next();

      res.cookies.set("accessToken", data.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60,
      });

      res.cookies.set("refreshToken", data.refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    } catch {
      // ❌ Refresh failed → logout
      url.pathname = "/";
      const res = NextResponse.redirect(url);
      clearCookies(res);
      return res;
    }
  }

  // ✅ All good
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
// import { NextRequest, NextResponse } from "next/server";
// import { jwtVerify } from "jose";

// const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// const REFRESH_SECRET = new TextEncoder().encode(
//   process.env.REFRESH_TOKEN_SECRET
// );
// const ACCESS_SECRET = new TextEncoder().encode(
//   process.env.ACCESS_TOKEN_SECRET
// );

// async function verifyRefreshToken(token: string): Promise<boolean> {
//   try {
//     await jwtVerify(token, REFRESH_SECRET);
//     return true;
//   } catch {
//     return false;
//   }
// }

// async function verifyAccessToken(token: string): Promise<boolean> {
//   try {
//     await jwtVerify(token, ACCESS_SECRET);
//     return true;
//   } catch {
//     return false;
//   }
// }

// async function callRefreshEndpoint(refreshToken: string): Promise<{
//   success: boolean;
//   accessToken?: string;
//   refreshToken?: string;
// }> {
//   try {
//     const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
//       method: "POST",
//       headers: {
//         Cookie: `refreshToken=${refreshToken}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!res.ok) return { success: false };

//     const setCookieHeader = res.headers.get("set-cookie");
//     if (!setCookieHeader) return { success: false };

//     const accessTokenMatch = setCookieHeader.match(/accessToken=([^;]+)/);
//     const refreshTokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);

//     if (!accessTokenMatch?.[1] || !refreshTokenMatch?.[1]) {
//       return { success: false };
//     }

//     return {
//       success: true,
//       accessToken: accessTokenMatch[1],
//       refreshToken: refreshTokenMatch[1],
//     };
//   } catch (err) {
//     console.error("❌ Refresh endpoint error:", err);
//     return { success: false };
//   }
// }

// // ✅ Helper to clear auth cookies on a redirect response
// function redirectAndClearCookies(url: URL): NextResponse {
//   const response = NextResponse.redirect(url);
//   response.cookies.delete("accessToken");
//   response.cookies.delete("refreshToken");
//   return response;
// }

// export async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const url = req.nextUrl.clone();

//   const accessToken = req.cookies.get("accessToken")?.value;
//   const refreshToken = req.cookies.get("refreshToken")?.value;

//   const isRefreshValid = refreshToken
//     ? await verifyRefreshToken(refreshToken)
//     : false;

//   const isAccessValid = accessToken
//     ? await verifyAccessToken(accessToken)
//     : false;

//   // ❌ No valid refresh token → only allow "/"
//   if (!isRefreshValid) {
//     if (pathname === "/") return NextResponse.next();
//     url.pathname = "/";
//     return redirectAndClearCookies(url); // ✅ clear any stale cookies
//   }

//   // ✅ Logged in, visiting "/" → redirect to app
//   if (pathname === "/" && isRefreshValid) {
//     url.pathname = "/library";
//     return NextResponse.redirect(url);
//   }

//   // 🔄 refreshToken valid (JWT) but accessToken expired/missing → refresh silently
//   if (isRefreshValid && !isAccessValid) {

//     const result = await callRefreshEndpoint(refreshToken!);

//     // ✅ Refresh failed (token not in DB, revoked, etc.) → clear cookies & redirect
//     if (!result.success || !result.accessToken || !result.refreshToken) {
//       url.pathname = "/";
//       return redirectAndClearCookies(url); // ✅ breaks the infinite loop
//     }

  

//     const response = NextResponse.next();

//     response.cookies.set("accessToken", result.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 15 * 60,
//     });

//     response.cookies.set("refreshToken", result.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 30 * 24 * 60 * 60,
//     });

//     return response;
//   }

//   // ✅ Both valid — proceed
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };
