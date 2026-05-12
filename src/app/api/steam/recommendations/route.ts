import { type NextRequest, NextResponse } from "next/server";

import { backendApiUrl, bearerHeaders, steamSessionToken } from "@/lib/steam-session";

export async function GET(req: NextRequest) {
  const token = steamSessionToken(req);
  if (!token) return NextResponse.json({ detail: "未登录 Steam" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") ?? "released";
  const limit = req.nextUrl.searchParams.get("limit") ?? "18";
  const upstream = await fetch(
    backendApiUrl(`/public/steam/recommendations?kind=${encodeURIComponent(kind)}&limit=${encodeURIComponent(limit)}`),
    {
      headers: bearerHeaders(token),
      cache: "no-store",
    },
  );
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
