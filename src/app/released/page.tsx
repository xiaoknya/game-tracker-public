import { Gamepad2 } from "lucide-react";

import { GameTile } from "@/components/game-tile";
import { MetricRow } from "@/components/metric-row";
import { SiteHeader } from "@/components/site-header";
import { gameApi } from "@/lib/api";
import { compactNumber } from "@/lib/format";

export default async function ReleasedPage() {
  const games = await gameApi.listReleased(180);
  const reviewed = games.filter((game) => game.steam_review_total);
  const positive = reviewed.filter((game) => {
    if (!game.steam_review_positive || !game.steam_review_total) return false;
    return game.steam_review_positive / game.steam_review_total >= 0.8;
  });

  return (
    <main className="min-h-screen text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-teal-100/70">
          <Gamepad2 className="size-4" />
          Released games
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">近期已发售</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
          观察上线后的 Steam 评测、语言分布和社区余温，适合回看首发后的真实玩家反馈。
        </p>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-2 sm:grid-cols-3">
          <MetricRow label="180 天内" value={`${games.length}`} />
          <MetricRow label="有评测样本" value={`${reviewed.length}`} sub="Steam reviews" />
          <MetricRow label="好评占优" value={`${positive.length}`} sub="正向率约 80%+" tone="teal" />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {games.map((game) => (
              <GameTile key={game.id} game={game} />
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-t border-white/10 py-5">
              <div className="text-sm text-white/70">评测最多</div>
              {reviewed
                .slice()
                .sort((a, b) => (b.steam_review_total ?? 0) - (a.steam_review_total ?? 0))
                .slice(0, 5)
                .map((game) => (
                  <div key={game.id} className="border-t border-white/10 py-3">
                    <div className="text-sm text-white">{game.name}</div>
                    <div className="mt-1 text-xs text-white/45">
                      {compactNumber(game.steam_review_total)} reviews · {game.steam_review_score_desc || "No label"}
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

