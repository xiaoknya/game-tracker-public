import { type NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.GAME_TRACKER_API_BASE?.replace(/\/$/, "") ??
  "http://localhost:8000/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = req.nextUrl.searchParams.get("limit") ?? "15";

  if (!q.trim()) return NextResponse.json([]);

  try {
    const upstream = await fetch(
      `${API_BASE}/games/search?q=${encodeURIComponent(q)}&limit=${limit}`,
      { cache: "no-store" },
    );
    if (!upstream.ok) return NextResponse.json([]);
    return NextResponse.json(await upstream.json());
  } catch {
    return NextResponse.json([]);
  }
}
