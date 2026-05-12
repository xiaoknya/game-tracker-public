import { type NextRequest, NextResponse } from "next/server";

import {
  backendApiUrl,
  bearerHeaders,
  publicOrigin,
  STEAM_SESSION_COOKIE,
  steamSessionToken,
} from "@/lib/steam-session";

export async function POST(req: NextRequest) {
  const token = steamSessionToken(req);
  if (token) {
    await fetch(backendApiUrl("/public/steam/session"), {
      method: "DELETE",
      headers: bearerHeaders(token),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ message: "已退出 Steam 登录" });
  res.cookies.set(STEAM_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: publicOrigin(req).startsWith("https://"),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
