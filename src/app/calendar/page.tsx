import Link from "next/link";

import { AppShell, MobileNav } from "@/components/app-shell";
import { RatingBadge } from "@/components/rating-badge";
import { SectionPanel } from "@/components/section-panel";
import { gameApi, type Game } from "@/lib/api";
import { compactNumber, releaseDate } from "@/lib/format";

export default async function CalendarPage() {
  const [upcoming, fuzzy] = await Promise.all([
    gameApi.listUpcoming({ days: 180 }),
    gameApi.listFuzzy(),
  ]);
  const byMonth = groupByMonth(upcoming);

  return (
    <AppShell activePath="/calendar">
      <MobileNav />
      <SectionPanel
        title="发售日历"
        count={upcoming.length}
        subtitle="当前展示未来 180 天内有精确日期的追踪游戏"
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {Object.entries(byMonth).map(([month, games]) => (
              <section key={month} className="overflow-hidden rounded-lg border border-[#2a2d3e] bg-[#1a1d2e]">
                <div className="flex items-end justify-between border-b border-[#2a2d3e] px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#7b8cde]">Release Month</div>
                    <h2 className="mt-1 text-xl font-semibold text-[#e0e4f0]">{month}</h2>
                  </div>
                  <span className="text-xs text-[#7a8099]">{games.length} 款</span>
                </div>
                <div className="divide-y divide-[#2a2d3e]">
                  {games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="grid gap-3 px-4 py-3 transition hover:bg-[#202437] sm:grid-cols-[120px_1fr_96px]"
                    >
                      <div className="font-mono text-sm text-[#a0a8c0]">
                        {releaseDate(game.release_date, game.release_date_is_fuzzy)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <RatingBadge rating={game.rating} />
                          <span className="truncate text-sm font-semibold text-[#e0e4f0]">{game.name}</span>
                        </div>
                        <div className="mt-1 truncate text-xs text-[#7a8099]">
                          {game.developer || game.publisher || game.name_en || "开发商待补充"}
                        </div>
                      </div>
                      <div className="font-mono text-sm text-[#a0a8c0] sm:text-right">
                        {compactNumber(game.followers)}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4 xl:sticky xl:top-24 xl:self-start">
            <div className="text-sm font-semibold text-[#e0e4f0]">模糊发售日</div>
            <div className="mt-3 divide-y divide-[#2a2d3e]">
              {fuzzy.slice(0, 12).map((game) => (
                <Link key={game.id} href={`/games/${game.id}`} className="block py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="line-clamp-1 text-sm text-[#d9def0]">{game.name}</span>
                    <RatingBadge rating={game.rating} />
                  </div>
                  <div className="mt-1 text-xs text-[#7a8099]">
                    {releaseDate(game.release_date, true)} · {compactNumber(game.followers)}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </SectionPanel>
    </AppShell>
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

