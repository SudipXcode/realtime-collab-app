import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(req: NextRequest) {
  try {
    // ✅ Forward cookies to backend
    const cookieHeader = req.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/task/today`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    const response = NextResponse.json(data, {
      status: res.status,
    });

    // ✅ Forward set-cookie headers from backend
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (err) {
    console.error("BFF ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
