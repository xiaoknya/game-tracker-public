import { type NextRequest, NextResponse } from "next/server";

import {
  backendApiUrl,
  publicOrigin,
  STEAM_SESSION_COOKIE,
  STEAM_STATE_COOKIE,
} from "@/lib/steam-session";

export async function GET(req: NextRequest) {
  const origin = publicOrigin(req);
  const expectedState = req.cookies.get(STEAM_STATE_COOKIE)?.value ?? "";
  const actualState = req.nextUrl.searchParams.get("state") ?? "";
  const redirectTarget = new URL("/recommendations", origin);

  if (!expectedState || expectedState !== actualState) {
    redirectTarget.searchParams.set("steam_error", "invalid_state");
    return NextResponse.redirect(redirectTarget, 302);
  }

  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const upstream = await fetch(backendApiUrl("/public/steam/openid/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params }),
      cache: "no-store",
    });
    if (!upstream.ok) {
      redirectTarget.searchParams.set("steam_error", String(upstream.status));
      return NextResponse.redirect(redirectTarget, 302);
    }
    const data = (await upstream.json()) as { session_token?: string };
    if (!data.session_token) {
      redirectTarget.searchParams.set("steam_error", "missing_session");
      return NextResponse.redirect(redirectTarget, 302);
    }

    const res = NextResponse.redirect(redirectTarget, 302);
    res.cookies.delete(STEAM_STATE_COOKIE);
    res.cookies.set(STEAM_SESSION_COOKIE, data.session_token, {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: "lax",
      maxAge: 180 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch {
    redirectTarget.searchParams.set("steam_error", "network");
    return NextResponse.redirect(redirectTarget, 302);
  }
}
