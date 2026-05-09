import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, Gauge, Search, TrendingUp } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { GameTile } from "@/components/game-tile";
import { MetricRow } from "@/components/metric-row";
import { RatingBadge } from "@/components/rating-badge";
import { SiteHeader } from "@/components/site-header";
import { gameApi, steamCover } from "@/lib/api";
import { compactNumber, releaseStatus, signedCompact, tagsFromGame } from "@/lib/format";

const ratings = ["", "S", "A", "B", "C"];
const days = [30, 60, 90, 180];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; days?: string }>;
}) {
  const params = await searchParams;
  const selectedRating = params.rating?.toUpperCase() ?? "";
  const selectedDays = Number(params.days ?? 60);
  const [upcoming, fuzzy, released] = await Promise.all([
    gameApi.listUpcoming({
      rating: selectedRating || undefined,
      days: Number.isFinite(selectedDays) ? selectedDays : 60,
    }),
    gameApi.listFuzzy(),
    gameApi.listReleased(60),
  ]);

  const lead = upcoming[0] ?? fuzzy[0] ?? released[0];
  const leadImage = lead ? lead.cover_image || steamCover(lead.steam_appid) : "";
  const heroTags = lead ? tagsFromGame(lead, 4) : [];
  const sCount = upcoming.filter((game) => game.rating === "S").length;
  const aCount = upcoming.filter((game) => game.rating === "A").length;

  return (
    <main className="min-h-screen text-white">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        {leadImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={leadImage}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35 blur-[1px] scale-105"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#07090f_0%,rgba(7,9,15,.92)_34%,rgba(7,9,15,.45)_100%)]" />

        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="animate-rise max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 border-l-2 border-teal-300 pl-3 text-xs uppercase tracking-[0.26em] text-teal-100/80">
              Public release radar
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
              Game Tracker
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
              面向公众的游戏热度榜：看 Steam 关注、7 日增长、社区声量和发售窗口，快速发现值得提前加入愿望单的新作。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#ranking"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-teal-300 text-[#071014] hover:bg-teal-200",
                })}
              >
                查看热度榜 <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/calendar"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/20 bg-white/5 text-white hover:bg-white/10",
                })}
              >
                发售日历 <CalendarDays className="size-4" />
              </Link>
            </div>
          </div>

          {lead ? (
            <Link
              href={`/games/${lead.id}`}
              className="animate-fade group ml-auto hidden w-full max-w-xl rounded-md border border-white/12 bg-black/30 p-3 shadow-2xl shadow-black/40 backdrop-blur md:block"
            >
              <div className="aspect-[16/9] overflow-hidden rounded bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leadImage}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="grid gap-6 p-5 lg:grid-cols-[1fr_160px]">
                <div>
                  <div className="flex items-center gap-2">
                    <RatingBadge rating={lead.rating} />
                    <span className="text-xs text-white/45">{releaseStatus(lead)}</span>
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-2xl font-semibold">{lead.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {heroTags.map((tag) => (
                      <span key={tag} className="rounded-sm bg-white/10 px-2 py-1 text-xs text-white/55">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:block">
                  <MetricRow label="Followers" value={compactNumber(lead.followers)} />
                  <MetricRow label="7d Growth" value={signedCompact(lead.followers_7d_delta)} tone="teal" />
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricRow label="追踪中" value={`${upcoming.length}`} sub={`${selectedDays} 天窗口`} />
        <MetricRow label="S 级" value={`${sCount}`} sub="强热度信号" tone="rose" />
        <MetricRow label="A 级" value={`${aCount}`} sub="高关注候选" tone="amber" />
        <MetricRow label="待定档期" value={`${fuzzy.length}`} sub="月份/季度待确认" />
      </section>

      <section id="ranking" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-t border-white/10 pt-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-teal-100/70">
              <Flame className="size-4" />
              Upcoming ranking
            </div>
            <h2 className="mt-2 text-3xl font-semibold">即将发售热度榜</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              默认只展示已有 SteamDB followers 且关注数超过阈值的游戏；排序沿用后端综合评分。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ratings.map((rating) => (
              <Link
                key={rating || "all"}
                href={`/?${new URLSearchParams({
                  ...(rating ? { rating } : {}),
                  days: String(selectedDays),
                }).toString()}#ranking`}
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  selectedRating === rating
                    ? "border-teal-200 bg-teal-200 text-[#071014]"
                    : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"
                }`}
              >
                {rating || "全部"}
              </Link>
            ))}
            {days.map((item) => (
              <Link
                key={item}
                href={`/?${new URLSearchParams({
                  ...(selectedRating ? { rating: selectedRating } : {}),
                  days: String(item),
                }).toString()}#ranking`}
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  selectedDays === item
                    ? "border-white bg-white text-[#071014]"
                    : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"
                }`}
              >
                {item}天
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {upcoming.length ? (
              upcoming.map((game) => <GameTile key={game.id} game={game} />)
            ) : (
              <EmptyState icon={<Search className="size-5" />} title="当前筛选暂无游戏" />
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-t border-white/10 py-5">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Gauge className="size-4 text-teal-200" />
                榜单口径
              </div>
              <p className="mt-3 text-sm leading-6 text-white/45">
                综合分来自 followers、增长、Reddit、Bilibili 和 MOD 空间五个维度。公共版暂不展示内部评审人和后台操作入口。
              </p>
            </div>
            <div className="border-t border-white/10 py-5">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <TrendingUp className="size-4 text-teal-200" />
                待定发售日
              </div>
              <div className="mt-2">
                {fuzzy.slice(0, 4).map((game) => (
                  <GameTile key={game.id} game={game} compact />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="grid min-h-56 place-items-center border-t border-white/10 text-white/45">
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </div>
    </div>
  );
}
