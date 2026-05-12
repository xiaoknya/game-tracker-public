import { type NextRequest, NextResponse } from "next/server";

import { backendApiUrl, bearerHeaders, steamSessionToken } from "@/lib/steam-session";

export async function POST(req: NextRequest) {
  const token = steamSessionToken(req);
  if (!token) return NextResponse.json({ detail: "未登录 Steam" }, { status: 401 });

  const upstream = await fetch(backendApiUrl("/public/steam/sync-library"), {
    method: "POST",
    headers: bearerHeaders(token),
    cache: "no-store",
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
