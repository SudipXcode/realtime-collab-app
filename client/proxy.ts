// import { NextRequest, NextResponse } from "next/server";
// import { jwtVerify } from "jose";

// const BACKEND_URL =
//   process.env.BACKEND_URL ||
//   "https://realtime-collab-app-production.up.railway.app";

// const REFRESH_SECRET = new TextEncoder().encode(
//   process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
// );
// const ACCESS_SECRET = new TextEncoder().encode(
//   process.env.ACCESS_TOKEN_SECRET || "access-secret",
// );

// // ✅ Verify JWT without calling backend
// async function verifyToken(
//   token: string,
//   secret: Uint8Array,
// ): Promise<boolean> {
//   try {
//     await jwtVerify(token, secret);
//     return true;
//   } catch {
//     return false;
//   }
// }

// // ✅ Parse cookies from Set-Cookie header
// function parseSetCookieHeader(setCookieHeader: string): {
//   name: string;
//   value: string;
// }[] {
//   if (!setCookieHeader) return [];

//   // Handle multiple Set-Cookie headers (they come as comma-separated in some cases)
//   const cookies: { name: string; value: string }[] = [];

//   // Split by comma but be careful about the format
//   const cookieStrings = setCookieHeader.split(/,\s*(?=\w+=)/);

//   for (const cookieStr of cookieStrings) {
//     const [nameValue] = cookieStr.split(";"); // Get only name=value part
//     const [name, value] = nameValue.split("=");

//     if (name && value) {
//       cookies.push({
//         name: name.trim(),
//         value: value.trim(),
//       });
//     }
//   }

//   return cookies;
// }

// // ✅ Call backend refresh endpoint
// async function callRefreshEndpoint(refreshTokenValue: string): Promise<{
//   success: boolean;
//   accessToken?: string;
//   refreshToken?: string;
// }> {
//   try {
//     const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
//       method: "POST",
//       headers: {
//         Cookie: `refreshToken=${refreshTokenValue}`,
//         "Content-Type": "application/json",
//       },
//       credentials: "include", // ✅ Important: send cookies with request
//     });

//     if (!res.ok) {
//       console.error(`❌ Refresh endpoint returned ${res.status}`);
//       return { success: false };
//     }

//     // ✅ Get Set-Cookie header(s) from response
//     const setCookieHeaders = res.headers.getSetCookie(); // ✅ Use getSetCookie() for Next.js

//     if (!setCookieHeaders || setCookieHeaders.length === 0) {
//       console.error("❌ No Set-Cookie header in response");
//       return { success: false };
//     }

//     let accessToken: string | undefined;
//     let refreshToken: string | undefined;

//     // Parse all Set-Cookie headers
//     for (const setCookieHeader of setCookieHeaders) {
//       const parsed = parseSetCookieHeader(setCookieHeader);

//       for (const cookie of parsed) {
//         if (cookie.name === "accessToken") {
//           accessToken = cookie.value;
//         } else if (cookie.name === "refreshToken") {
//           refreshToken = cookie.value;
//         }
//       }
//     }

//     if (!accessToken || !refreshToken) {
//       console.error("❌ Missing tokens in Set-Cookie headers");
//       console.error("Got headers:", setCookieHeaders);
//       return { success: false };
//     }

//     return {
//       success: true,
//       accessToken,
//       refreshToken,
//     };
//   } catch (err) {
//     console.error("❌ Refresh endpoint error:", err);
//     return { success: false };
//   }
// }

// // ✅ Helper to clear cookies on redirect
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

//   // 1️⃣ Check token validity
//   const isRefreshValid = refreshToken
//     ? await verifyToken(refreshToken, REFRESH_SECRET)
//     : false;

//   const isAccessValid = accessToken
//     ? await verifyToken(accessToken, ACCESS_SECRET)
//     : false;

//   // 2️⃣ No refresh token = not logged in
//   if (!isRefreshValid) {
//     // Only allow "/" (login page)
//     if (pathname === "/" || pathname.startsWith("/login")) {
//       return NextResponse.next();
//     }
//     // Redirect to home and clear cookies
//     url.pathname = "/";
//     return redirectAndClearCookies(url);
//   }

//   // 3️⃣ Logged in but visiting "/" → go to app
//   if ((pathname === "/" || pathname.startsWith("/login")) && isRefreshValid) {
//     url.pathname = "/library";
//     return NextResponse.redirect(url);
//   }

//   // 4️⃣ Refresh valid but access expired → refresh silently
//   if (isRefreshValid && !isAccessValid) {
//     console.log("🔄 Access token expired, refreshing...");

//     const result = await callRefreshEndpoint(refreshToken);

//     if (!result.success || !result.accessToken || !result.refreshToken) {
//       console.error("❌ Refresh failed, logging out");
//       url.pathname = "/";
//       return redirectAndClearCookies(url);
//     }

//     // ✅ Set new tokens in response
//     const response = NextResponse.next();

//     response.cookies.set("accessToken", result.accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       path: "/",
//       maxAge: 15 * 60 , // 15 minutes
//     });

//     response.cookies.set("refreshToken", result.refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       path: "/",
//       maxAge: 30 * 24 * 60 * 60 , // 30 days
//     });

//     return response;
//   }

//   // 5️⃣ Both valid → proceed
//   return NextResponse.next();
// }

// export const config = {
//   // Run on all routes EXCEPT Next.js internals and static files
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret"
);
const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "access-secret"
);

async function verifyToken(token: string, secret: Uint8Array): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// Call /api/auth/refresh through the Next.js rewrite (same-origin now)
async function callRefreshEndpoint(
  refreshTokenValue: string,
  req: NextRequest
): Promise<{ success: boolean; accessToken?: string; refreshToken?: string }> {
  try {
    // Build the internal URL using the request's host so it hits the rewrite
    const url = new URL("/api/auth/refresh", req.url);

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshTokenValue}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ Refresh endpoint returned ${res.status}`);
      return { success: false };
    }

    const setCookieHeaders = res.headers.getSetCookie();

    if (!setCookieHeaders || setCookieHeaders.length === 0) {
      console.error("❌ No Set-Cookie header in refresh response");
      return { success: false };
    }

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    for (const header of setCookieHeaders) {
      // Each header looks like: "accessToken=xxx; Path=/; HttpOnly; ..."
      const [nameValue] = header.split(";");
      const eqIdx = nameValue.indexOf("=");
      if (eqIdx === -1) continue;
      const name = nameValue.slice(0, eqIdx).trim();
      const value = nameValue.slice(eqIdx + 1).trim();

      if (name === "accessToken") accessToken = value;
      if (name === "refreshToken") refreshToken = value;
    }

    if (!accessToken || !refreshToken) {
      console.error("❌ Missing tokens in Set-Cookie headers");
      return { success: false };
    }

    return { success: true, accessToken, refreshToken };
  } catch (err) {
    console.error("❌ Refresh endpoint error:", err);
    return { success: false };
  }
}

function redirectAndClearCookies(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // ✅ lax works for same-origin (via rewrite proxy)
  path: "/",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // Skip middleware for API routes — let rewrites handle them
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isRefreshValid = refreshToken
    ? await verifyToken(refreshToken, REFRESH_SECRET)
    : false;

  const isAccessValid = accessToken
    ? await verifyToken(accessToken, ACCESS_SECRET)
    : false;

  const isAuthPage = pathname === "/" || pathname.startsWith("/login");

  // 1️⃣ No valid refresh token → only allow auth pages
  if (!isRefreshValid) {
    if (isAuthPage) return NextResponse.next();
    url.pathname = "/";
    return redirectAndClearCookies(url);
  }

  // 2️⃣ Logged in, visiting auth page → redirect to app
  if (isAuthPage && isRefreshValid) {
    url.pathname = "/library";
    return NextResponse.redirect(url);
  }

  // 3️⃣ Refresh valid but access token expired → refresh silently
  if (isRefreshValid && !isAccessValid) {
    console.log("🔄 Access token expired, refreshing...");

    const result = await callRefreshEndpoint(refreshToken!, req);

    if (!result.success || !result.accessToken || !result.refreshToken) {
      console.error("❌ Refresh failed, logging out");
      url.pathname = "/";
      return redirectAndClearCookies(url);
    }

    const response = NextResponse.next();

    response.cookies.set("accessToken", result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  }

  // 4️⃣ Both valid → proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};