
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret"
);
const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "access-secret"
);

// ✅ Verify JWT without calling backend
async function verifyToken(token: string, secret: Uint8Array): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// ✅ Call backend refresh endpoint
async function callRefreshEndpoint(refreshToken: string): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return { success: false };

    // Parse new tokens from response headers or body
    const setCookieHeader = res.headers.get("set-cookie");
    if (!setCookieHeader) return { success: false };

    const accessTokenMatch = setCookieHeader.match(/accessToken=([^;]+)/);
    const refreshTokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);

    if (!accessTokenMatch?.[1] || !refreshTokenMatch?.[1]) {
      return { success: false };
    }

    return {
      success: true,
      accessToken: accessTokenMatch[1],
      refreshToken: refreshTokenMatch[1],
    };
  } catch (err) {
    console.error("❌ Refresh endpoint error:", err);
    return { success: false };
  }
}

// ✅ Helper to clear cookies on redirect
function redirectAndClearCookies(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // 1️⃣ Check token validity
  const isRefreshValid = refreshToken
    ? await verifyToken(refreshToken, REFRESH_SECRET)
    : false;

  const isAccessValid = accessToken
    ? await verifyToken(accessToken, ACCESS_SECRET)
    : false;

  // 2️⃣ No refresh token = not logged in
  if (!isRefreshValid) {
    // Only allow "/" (login page)
    if (pathname === "/" || pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    // Redirect to home and clear cookies
    url.pathname = "/";
    return redirectAndClearCookies(url);
  }

  // 3️⃣ Logged in but visiting "/" → go to app
  if ((pathname === "/" || pathname.startsWith("/login")) && isRefreshValid) {
    url.pathname = "/library";
    return NextResponse.redirect(url);
  }

  // 4️⃣ Refresh valid but access expired → refresh silently
  if (isRefreshValid && !isAccessValid) {
    console.log("🔄 Access token expired, refreshing...");
    
    const result = await callRefreshEndpoint(refreshToken);

    if (!result.success || !result.accessToken || !result.refreshToken) {
      console.error("❌ Refresh failed, logging out");
      url.pathname = "/";
      return redirectAndClearCookies(url);
    }

    // ✅ Set new tokens in response
    const response = NextResponse.next();

    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  }

  // 5️⃣ Both valid → proceed
  return NextResponse.next();
}

export const config = {
  // Run on all routes EXCEPT Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};