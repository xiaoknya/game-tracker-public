import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { GameTile } from "@/components/game-tile";
import { MetricRow } from "@/components/metric-row";
import { RatingBadge } from "@/components/rating-badge";
import { SiteHeader } from "@/components/site-header";
import { Sparkline } from "@/components/sparkline";
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
  const latestReview = latestSnapshot?.steam_review_total;
  const positiveRate =
    latestSnapshot?.steam_review_total && latestSnapshot.steam_review_positive
      ? Math.round((latestSnapshot.steam_review_positive / latestSnapshot.steam_review_total) * 100)
      : null;

  return (
    <main className="min-h-screen text-white">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 blur-[1px] scale-105"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#07090f_0%,rgba(7,9,15,.94)_45%,rgba(7,9,15,.55)_100%)]" />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div className="animate-rise">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                className: "mb-8 text-white/60 hover:text-white",
              })}
            >
              <ArrowLeft className="size-4" />
              返回热度榜
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <RatingBadge rating={game.rating} />
              <span className="text-sm text-white/50">{releaseStatus(game)}</span>
            </div>
            <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              {game.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
              {game.short_description || game.name_en || "暂无简介"}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-sm bg-white/10 px-2 py-1 text-xs text-white/60">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {game.steam_url ? (
                <a
                  href={game.steam_url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    className: "bg-teal-300 text-[#071014] hover:bg-teal-200",
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
                    className: "border-white/20 bg-white/5 text-white hover:bg-white/10",
                  })}
                >
                  SteamDB <ExternalLink className="size-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="animate-fade rounded-md border border-white/12 bg-black/25 p-4 backdrop-blur">
            <div className="aspect-[16/9] overflow-hidden rounded bg-white/5">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <Sparkline snapshots={snapshots} className="mt-5 h-24 w-full" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="grid gap-8 border-t border-white/10 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <MetricRow label="Followers" value={compactNumber(game.followers)} sub="SteamDB community" />
            <MetricRow label="7 日增长" value={signedCompact(game.followers_7d_delta)} tone="teal" />
            <MetricRow label="综合分" value={score(game.total_score)} sub={game.score_date || "未评分"} />
            <MetricRow label="发售日" value={releaseDate(game.release_date, game.release_date_is_fuzzy)} />
          </div>

          <section className="mt-12 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-semibold">评分拆解</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Followers", latestScore?.score_followers],
                ["Growth", latestScore?.score_growth],
                ["Reddit", latestScore?.score_reddit ?? latestScore?.score_baidu],
                ["Bilibili", latestScore?.score_bilibili],
                ["MOD", latestScore?.score_mod],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-white/10 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/55">{label}</span>
                    <span className="font-mono text-white">{typeof value === "number" ? value.toFixed(2) : "—"}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-teal-300"
                      style={{ width: `${Math.min(100, ((Number(value) || 0) / 4.5) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {reviewSummary?.topics?.length ? (
            <section className="mt-12 border-t border-white/10 pt-8">
              <h2 className="text-2xl font-semibold">玩家评测摘要</h2>
              <div className="mt-6 grid gap-4">
                {reviewSummary.topics.slice(0, 4).map((topic) => (
                  <article key={topic.title} className="border-t border-white/10 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold">{topic.title}</h3>
                      <span className="font-mono text-sm text-teal-100">{topic.pct}%</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/50">{topic.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <MetricRow
            label="Steam Reviews"
            value={latestReview ? integer(latestReview) : "—"}
            sub={positiveRate ? `${positiveRate}% positive` : "暂无评测样本"}
            tone={positiveRate && positiveRate >= 80 ? "teal" : undefined}
          />
          <MetricRow
            label="Median Playtime"
            value={
              latestSnapshot?.steam_median_playtime
                ? `${Math.round(latestSnapshot.steam_median_playtime / 60)}h`
                : "—"
            }
            sub="近期评测样本"
          />
          <div className="border-t border-white/10 py-5">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Users className="size-4 text-teal-200" />
              月度评测
            </div>
            <div className="mt-4 space-y-2">
              {reviewMonthly.slice(-6).map((item) => (
                <div key={item.month} className="flex items-center justify-between text-sm">
                  <span className="text-white/45">{item.month.slice(0, 7)}</span>
                  <span className="font-mono text-white/70">{compactNumber(item.new_reviews)}</span>
                </div>
              ))}
            </div>
          </div>
          {similar.length ? (
            <div className="border-t border-white/10 py-5">
              <div className="text-sm text-white/70">相似游戏</div>
              <div className="mt-2">
                {similar.map((item) => (
                  <GameTile
                    key={item.id}
                    compact
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
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
