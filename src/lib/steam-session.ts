import { type NextRequest } from "next/server";

export const STEAM_SESSION_COOKIE = "gt_public_steam_session";
export const STEAM_STATE_COOKIE = "gt_public_steam_state";

const API_BASE =
  process.env.GAME_TRACKER_API_BASE?.replace(/\/$/, "") ??
  "http://localhost:8000/api";

export function backendApiUrl(path: string) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function publicOrigin(req: NextRequest) {
  return (
    process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    req.nextUrl.origin
  );
}

export function steamSessionToken(req: NextRequest) {
  return req.cookies.get(STEAM_SESSION_COOKIE)?.value ?? "";
}

export function bearerHeaders(token: string, extra?: HeadersInit): HeadersInit {
  return {
    ...(extra ?? {}),
    Authorization: `Bearer ${token}`,
  };
}
