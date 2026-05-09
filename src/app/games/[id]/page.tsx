import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AppShell, MobileNav } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { MetricRow } from "@/components/metric-row";
import { RatingBadge } from "@/components/rating-badge";
import { Sparkline } from "@/components/sparkline";
import { buttonVariants } from "@/components/ui/button";
import { gameApi, steamCover } from "@/lib/api";
import { compactNumber, integer, releaseDate, releaseStatus, score, signedCompact, tagsFromGame } from "@/lib/format";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gameId = Number(id);
  if (!Number.isFinite(gameId)) notFound();

  const [game, snapshots, scores, reviewMonthly, reviewSummary, similar] = await Promise.all([
    gameApi.getGame(gameId),
    gameApi.getTrend(gameId, 45),
    gameApi.getScores(gameId),
    gameApi.getReviewMonthly(gameId, 12),
    gameApi.getReviewSummary(gameId),
    gameApi.getSimilar(gameId),
  ]);

  if (!game) notFound();

  const image = game.cover_image || steamCover(game.steam_appid);
  const latestSnapshot = snapshots.at(-1);
  const latestScore = scores[0];
  const tags = tagsFromGame(game, 6);
  const positiveRate =
    latestSnapshot?.steam_review_total && latestSnapshot.steam_review_positive
      ? Math.round((latestSnapshot.steam_review_positive / latestSnapshot.steam_review_total) * 100)
      : null;

  return (
    <AppShell activePath="/games">
      <MobileNav />
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-[#7a8099] transition hover:text-[#d9def0]"
      >
        <ArrowLeft className="size-4" />
        返回主看板
      </Link>

      <section className="overflow-hidden rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] shadow-[0_10px_26px_rgba(2,6,23,0.3)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <RatingBadge rating={game.rating} />
              <span className="rounded-sm bg-[#0f1117] px-2 py-1 text-xs text-[#a0a8c0]">
                {releaseStatus(game)}
              </span>
              <span className="rounded-sm bg-[#0f1117] px-2 py-1 text-xs text-[#a0a8c0]">
                发售日: {releaseDate(game.release_date, game.release_date_is_fuzzy)}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#e0e4f0] sm:text-4xl">
              {game.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#7a8099]">
              {game.developer ? <span>开发商: {game.developer}</span> : null}
              {game.publisher && game.publisher !== game.developer ? <span>发行商: {game.publisher}</span> : null}
            </div>
            {game.short_description ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a0a8c0]">{game.short_description}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-sm bg-[#0f1117] px-2 py-1 text-[11px] text-[#7a8099]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {game.steam_url ? (
                <a
                  href={game.steam_url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    className: "bg-[#7b8cde] text-white hover:bg-[#8fa0ff]",
                  })}
                >
                  Steam <ExternalLink className="size-4" />
                </a>
              ) : null}
              {game.steamdb_url ? (
                <a
                  href={game.steamdb_url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "border-[#2a2d3e] bg-[#0f1117] text-[#d9def0] hover:bg-[#202437]",
                  })}
                >
                  SteamDB <ExternalLink className="size-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-[#0b0e16]">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="grid gap-3 rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4 sm:grid-cols-4">
            <MetricRow label="Followers" value={compactNumber(game.followers)} sub="SteamDB" />
            <MetricRow label="7日增长" value={signedCompact(game.followers_7d_delta)} tone="teal" />
            <MetricRow label="综合分" value={score(game.total_score)} sub={game.score_date || "未评分"} />
            <MetricRow label="Steam 评测" value={latestSnapshot?.steam_review_total ? integer(latestSnapshot.steam_review_total) : "—"} sub={positiveRate ? `${positiveRate}% 好评` : undefined} />
          </div>

          <section className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
            <div className="mb-3">
              <div className="text-xs uppercase tracking-[0.16em] text-[#7b8cde]">Trendline</div>
              <h2 className="mt-1 text-base font-semibold text-[#e0e4f0]">Followers 趋势（45天）</h2>
            </div>
            <Sparkline snapshots={snapshots} className="h-32 w-full" />
          </section>

          <section className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-[#7b8cde]">Score Radar</div>
            <h2 className="mt-1 text-base font-semibold text-[#e0e4f0]">五维评分拆解</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Followers", latestScore?.score_followers],
                ["增长", latestScore?.score_growth],
                ["Reddit", latestScore?.score_reddit ?? latestScore?.score_baidu],
                ["Bilibili", latestScore?.score_bilibili],
                ["MOD", latestScore?.score_mod],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-[#0f1117] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#a0a8c0]">{label}</span>
                    <span className="font-mono text-[#e0e4f0]">{typeof value === "number" ? value.toFixed(2) : "—"}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2a2d3e]">
                    <div
                      className="h-full rounded-full bg-[#7b8cde]"
                      style={{ width: `${Math.min(100, ((Number(value) || 0) / 4.5) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {reviewSummary?.topics?.length ? (
            <section className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#7b8cde]">Review Insight</div>
              <h2 className="mt-1 text-base font-semibold text-[#e0e4f0]">玩家评测摘要</h2>
              <div className="mt-4 divide-y divide-[#2a2d3e]">
                {reviewSummary.topics.slice(0, 4).map((topic) => (
                  <article key={topic.title} className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-[#d9def0]">{topic.title}</h3>
                      <span className="font-mono text-xs text-[#7b8cde]">{topic.pct}%</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#a0a8c0]">{topic.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
            <div className="text-sm font-semibold text-[#e0e4f0]">月度评测趋势</div>
            <div className="mt-4 space-y-2">
              {reviewMonthly.slice(-6).map((item) => (
                <div key={item.month} className="flex items-center justify-between text-sm">
                  <span className="text-[#7a8099]">{item.month.slice(0, 7)}</span>
                  <span className="font-mono text-[#a0a8c0]">{compactNumber(item.new_reviews)}</span>
                </div>
              ))}
            </div>
          </section>

          {similar.length ? (
            <section className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
              <div className="mb-3 text-sm font-semibold text-[#e0e4f0]">相似游戏</div>
              <div className="grid gap-3">
                {similar.map((item) => (
                  <DashboardCard
                    key={item.id}
                    game={{
                      ...item,
                      name_en: null,
                      release_date: null,
                      release_date_is_fuzzy: null,
                      genre: null,
                      developer: null,
                      publisher: null,
                      tags: null,
                      short_description: null,
                      is_free: null,
                      steam_url: null,
                      steamdb_url: null,
                      reddit_subreddit: null,
                      social_links: null,
                      modifier_adaptation_required: null,
                      total_score: null,
                      score_date: null,
                      followers_7d_delta: null,
                      days_to_release: null,
                      steam_appid: item.steam_appid ?? 0,
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}

