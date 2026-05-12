import { randomBytes } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

import { publicOrigin, STEAM_STATE_COOKIE } from "@/lib/steam-session";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

export async function GET(req: NextRequest) {
  const origin = publicOrigin(req);
  const state = randomBytes(18).toString("base64url");
  const callback = new URL("/api/steam/callback", origin);
  callback.searchParams.set("state", state);

  const target = new URL(STEAM_OPENID_ENDPOINT);
  target.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
  target.searchParams.set("openid.mode", "checkid_setup");
  target.searchParams.set("openid.return_to", callback.toString());
  target.searchParams.set("openid.realm", origin);
  target.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
  target.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");

  const res = NextResponse.redirect(target, 302);
  res.cookies.set(STEAM_STATE_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
  return res;
}
