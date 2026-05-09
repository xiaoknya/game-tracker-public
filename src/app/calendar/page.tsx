import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { RatingBadge } from "@/components/rating-badge";
import { SiteHeader } from "@/components/site-header";
import { gameApi, type Game } from "@/lib/api";
import { compactNumber, releaseDate } from "@/lib/format";

export default async function CalendarPage() {
  const [upcoming, fuzzy] = await Promise.all([
    gameApi.listUpcoming({ days: 180 }),
    gameApi.listFuzzy(),
  ]);
  const byMonth = groupByMonth(upcoming);

  return (
    <main className="min-h-screen text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-teal-100/70">
          <CalendarDays className="size-4" />
          Release calendar
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">发售日历</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
          按月份查看未来 180 天的重点游戏，模糊日期单独列出，避免把季度窗口误读成精确发售。
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            {Object.entries(byMonth).map(([month, games]) => (
              <section key={month}>
                <div className="sticky top-16 z-20 border-y border-white/10 bg-[#07090f]/90 py-3 backdrop-blur">
                  <h2 className="text-2xl font-semibold">{month}</h2>
                  <div className="mt-1 text-sm text-white/40">{games.length} 款精确发售</div>
                </div>
                <div className="grid divide-y divide-white/10">
                  {games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="grid gap-4 py-5 transition hover:bg-white/[0.03] sm:grid-cols-[120px_1fr_92px]"
                    >
                      <div className="font-mono text-sm text-teal-100">
                        {releaseDate(game.release_date, game.release_date_is_fuzzy)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <RatingBadge rating={game.rating} />
                          <h3 className="font-semibold">{game.name}</h3>
                        </div>
                        <div className="mt-2 text-sm text-white/45">
                          {game.developer || game.publisher || game.name_en || "开发商待补充"}
                        </div>
                      </div>
                      <div className="text-left font-mono text-sm text-white/55 sm:text-right">
                        {compactNumber(game.followers)}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-t border-white/10 py-5">
              <div className="text-sm text-white/70">待定发售窗口</div>
              <div className="mt-4 space-y-3">
                {fuzzy.slice(0, 12).map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="block border-t border-white/10 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="line-clamp-1 text-sm text-white">{game.name}</span>
                      <RatingBadge rating={game.rating} />
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                      {releaseDate(game.release_date, true)} · {compactNumber(game.followers)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function groupByMonth(games: Game[]) {
  return games.reduce<Record<string, Game[]>>((acc, game) => {
    const key = game.release_date
      ? new Date(`${game.release_date}T00:00:00`).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
        })
      : "日期待定";
    acc[key] ??= [];
    acc[key].push(game);
    return acc;
  }, {});
}

