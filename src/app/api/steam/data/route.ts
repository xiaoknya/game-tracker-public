import { type NextRequest, NextResponse } from "next/server";

import {
  backendApiUrl,
  bearerHeaders,
  publicOrigin,
  STEAM_SESSION_COOKIE,
  steamSessionToken,
} from "@/lib/steam-session";

export async function DELETE(req: NextRequest) {
  const token = steamSessionToken(req);
  if (!token) return NextResponse.json({ detail: "未登录 Steam" }, { status: 401 });

  const upstream = await fetch(backendApiUrl("/public/steam/data"), {
    method: "DELETE",
    headers: bearerHeaders(token),
    cache: "no-store",
  });
  const data = await upstream.json().catch(() => ({}));
  const res = NextResponse.json(data, { status: upstream.status });
  if (upstream.ok) {
    res.cookies.set(STEAM_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: publicOrigin(req).startsWith("https://"),
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  }
  return res;
}
