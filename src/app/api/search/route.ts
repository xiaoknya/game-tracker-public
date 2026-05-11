import { type NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.GAME_TRACKER_API_BASE?.replace(/\/$/, "") ??
  "http://localhost:8000/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = req.nextUrl.searchParams.get("limit") ?? "15";
  const hot = req.nextUrl.searchParams.get("hot") === "1";

  if (!q.trim() && !hot) return NextResponse.json([]);

  try {
    const upstream = hot
      ? await fetch(`${API_BASE}/games?days=60&limit=${limit}`, { cache: "no-store" })
      : await fetch(
          `${API_BASE}/games/search?q=${encodeURIComponent(q)}&limit=${limit}`,
          { cache: "no-store" },
        );
    if (!upstream.ok) return NextResponse.json([]);
    const data = await upstream.json();
    if (!hot) return NextResponse.json(data);
    return NextResponse.json(
      Array.isArray(data)
        ? data
            .filter((game) => game?.rating === "S" || game?.rating === "A")
            .sort((a, b) => (b?.total_score ?? 0) - (a?.total_score ?? 0))
            .slice(0, Number(limit))
        : [],
    );
  } catch {
    return NextResponse.json([]);
  }
}
