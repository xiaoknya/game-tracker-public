import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Users } from "lucide-react";

import { AppShell, MobileNav } from "@/components/app-shell";
import { FollowersTrend } from "@/components/charts/followers-trend";
import { ReviewTrend } from "@/components/charts/review-trend";
import { ScoreRadar } from "@/components/charts/score-radar";
import { RatingBadge } from "@/components/rating-badge";
import { ScoreInfo } from "@/components/score-info";
import { SentimentRing } from "@/components/sentiment-ring";
import { buttonVariants } from "@/components/ui/button";
import { gameApi, steamCover, type ReleasedGame } from "@/lib/api";
import {
  compactNumber,
  integer,
  releaseDate,
  releaseStatus,
  score,
  signedCompact,
  tagsFromGame,
} from "@/lib/format";

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await gameApi.getGame(Number(id));
  return {
    title: game ? `${game.name} — Game Tracker` : "Game Tracker",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
  const latestSnap = snapshots.at(-1);
  const latestScore = scores[0];
  const tags = tagsFromGame(game, 8);

  // Reviews from the latest snapshot (if it's a released game the API can return these)
  const releaseGame = game as Partial<ReleasedGame>;
  const reviewTotal =
    latestSnap?.steam_review_total ?? releaseGame.steam_review_total ?? null;
  const reviewPositive =
    latestSnap?.steam_review_positive ?? releaseGame.steam_review_positive ?? null;
  const positiveRate =
    reviewTotal && reviewPositive
      ? Math.round((reviewPositive / reviewTotal) * 100)
      : null;

  // Language distribution: from latest monthly stat
  const latestLangDist =
    reviewMonthly.findLast((m) => m.language_dist)?.language_dist ??
    (releaseGame.language_dist ?? null);

  return (
    <AppShell activePath="/games">
      <MobileNav />

      {/* Back */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-[#7a8099] transition hover:text-[#d9def0]"
      >
        <ArrowLeft className="size-4" />
        返回主看板
      </Link>

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-[#2a2d3e] bg-[#12152b] shadow-[0_16px_48px_rgba(2,6,23,0.5)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_380px]">
          {/* Left: info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <RatingBadge rating={game.rating} />
              <span className="rounded bg-[#0f1117] px-2 py-1 text-xs text-[#a0a8c0]">
                {releaseStatus(game)}
              </span>
              <span className="rounded bg-[#0f1117] px-2 py-1 text-xs text-[#a0a8c0]">
                {releaseDate(game.release_date, game.release_date_is_fuzzy)}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#e0e4f0] sm:text-4xl">
              {game.name}
            </h1>
            {game.name_en && game.name_en !== game.name && (
              <p className="mt-1 text-sm text-[#5a6080]">{game.name_en}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7a8099]">
              {game.developer && <span>开发商：{game.developer}</span>}
              {game.publisher && game.publisher !== game.developer && (
                <span>发行商：{game.publisher}</span>
              )}
            </div>

            {game.short_description && (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a0a8c0]">
                {game.short_description}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="rounded bg-[#1c1f35] px-2 py-1 text-[12px] text-[#7a8099]">
                    {tag}
                  </span>
                ))}
                {game.is_free ? (
                  <span className="rounded bg-emerald-400/10 px-2 py-1 text-[12px] text-emerald-400">
                    免费游戏
                  </span>
                ) : null}
                {game.modifier_adaptation_required && (
                  <span className="rounded bg-amber-400/10 px-2 py-1 text-[12px] text-amber-400">
                    需 Mod 适配
                  </span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap gap-2">
              {game.steam_url && (
                <a
                  href={game.steam_url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ className: "bg-[#7b8cde] text-white hover:bg-[#8fa0ff]" })}
                >
                  Steam <ExternalLink className="size-3.5" />
                </a>
              )}
              {game.steamdb_url && (
                <a
                  href={game.steamdb_url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "border-[#2a2d3e] bg-[#0f1117] text-[#d9def0] hover:bg-[#202437]",
                  })}
                >
                  SteamDB <ExternalLink className="size-3.5" />
                </a>
              )}
              {/* Social links */}
              {game.social_links &&
                Object.entries(game.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      className: "border-[#2a2d3e] bg-[#0f1117] text-[#d9def0] hover:bg-[#202437] capitalize",
                    })}
                  >
                    {platform} <ExternalLink className="size-3.5" />
                  </a>
                ))}
            </div>
          </div>

          {/* Right: cover image */}
          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-[#0b0e16] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={game.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#3a3d55]">
                  No image
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Metric strip ──────────────────────────────────────────────────── */}
      <div className="mt-5 grid gap-3 rounded-xl border border-[#2a2d3e] bg-[#12152b] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCell
          label="SteamDB 关注"
          value={compactNumber(game.followers)}
          sub="cumulative followers"
        />
        <StatCell
          label="7 日涨幅"
          value={signedCompact(game.followers_7d_delta)}
          valueClass={
            (game.followers_7d_delta ?? 0) > 0
              ? "text-emerald-400"
              : (game.followers_7d_delta ?? 0) < 0
                ? "text-rose-400"
                : undefined
          }
          sub="vs. 7 days ago"
        />
        <StatCell
          label="综合评分"
          value={score(game.total_score)}
          valueClass="text-[#7b8cde]"
          sub={game.score_date ? `评于 ${game.score_date}` : "暂未评分"}
        />
        <StatCell
          label="Steam 评测"
          value={reviewTotal ? integer(reviewTotal) : "—"}
          sub={positiveRate ? `${positiveRate}% 好评` : latestSnap?.steam_review_score_desc ?? "暂无"}
        />
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Followers trend */}
          <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-5">
            <SectionHeader eyebrow="Trendline" title="Followers 趋势（45天）" />
            <div className="mt-4">
              <FollowersTrend snapshots={snapshots} />
            </div>
          </section>

          {/* Score radar */}
          <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-5">
            <div className="flex items-start justify-between gap-2">
              <SectionHeader eyebrow="Score Radar" title="五维评分" />
              <ScoreInfo />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[260px_1fr] items-center">
              <ScoreRadar latestScore={latestScore} />
              <div className="space-y-2">
                {[
                  { label: "Followers", val: latestScore?.score_followers },
                  { label: "增长速度", val: latestScore?.score_growth },
                  { label: "Reddit", val: latestScore?.score_reddit ?? latestScore?.score_baidu },
                  { label: "Bilibili", val: latestScore?.score_bilibili },
                  { label: "MOD 社区", val: latestScore?.score_mod },
                ].map(({ label, val }) => (
                  <ScoreBar key={label} label={label} value={val} max={4.5} />
                ))}
              </div>
            </div>
          </section>

          {/* Monthly review chart */}
          {reviewMonthly.length > 0 && (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-5">
              <SectionHeader eyebrow="Review Trend" title="月度评测趋势" />
              <div className="mt-4">
                <ReviewTrend data={reviewMonthly} />
              </div>
            </section>
          )}

          {/* Language distribution */}
          {latestLangDist && Object.keys(latestLangDist).length > 0 && (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-5">
              <SectionHeader eyebrow="Language Dist." title="玩家语言分布" />
              <LanguageBars dist={latestLangDist} />
            </section>
          )}

          {/* AI review summary */}
          {reviewSummary && (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-5">
              <div className="flex items-start justify-between gap-4">
                <SectionHeader eyebrow="Review Insight · AI" title="玩家评测摘要" />
                <div className="shrink-0 text-right">
                  <div className="text-[12px] text-[#4a5070]">
                    {reviewSummary.review_count.toLocaleString()} 条评测
                  </div>
                  <div className="text-[12px] text-[#4a5070]">
                    {reviewSummary.generated_at?.slice(0, 10)}
                  </div>
                </div>
              </div>

              {/* Topics — 3-column layout */}
              {reviewSummary.topics && reviewSummary.topics.length > 0 && (
                <ReviewTopicsGrid topics={reviewSummary.topics} />
              )}

              {/* Review tags */}
              {reviewSummary.tags && reviewSummary.tags.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-[12px] uppercase tracking-widest text-[#4a5070]">
                    高频词
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {reviewSummary.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#1c1f35] px-2.5 py-1 text-[12px] text-[#7a8099]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">

          {/* Steam review sentiment */}
          {reviewTotal ? (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-4">
              <SectionHeader eyebrow="Sentiment" title="Steam 好评率" compact />
              <div className="mt-3">
                <SentimentRing positive={reviewPositive} total={reviewTotal} />
              </div>
              {latestSnap?.steam_review_score_desc && (
                <div className="mt-3 rounded bg-[#1c1f35] px-3 py-2 text-xs text-[#a0a8c0]">
                  {latestSnap.steam_review_score_desc}
                </div>
              )}
            </section>
          ) : null}

          {/* Bilibili stats */}
          {(latestSnap?.bili_top_video_views || latestSnap?.bili_videos_over_1m || latestSnap?.bili_videos_over_500k) ? (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-4">
              <SectionHeader eyebrow="Bilibili" title="B 站热度" compact />
              <div className="mt-3 space-y-2">
                <SidebarStat label="最高视频播放" value={compactNumber(latestSnap.bili_top_video_views)} />
                <SidebarStat label="百万播放视频" value={String(latestSnap.bili_videos_over_1m ?? 0) + " 个"} />
                <SidebarStat label="50万播放视频" value={String(latestSnap.bili_videos_over_500k ?? 0) + " 个"} />
              </div>
            </section>
          ) : null}

          {/* Reddit community */}
          {(game.reddit_subreddit || latestSnap?.reddit_members) ? (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-4">
              <SectionHeader eyebrow="Reddit" title="社区规模" compact />
              <div className="mt-3 space-y-2">
                {game.reddit_subreddit && (
                  <a
                    href={`https://reddit.com/r/${game.reddit_subreddit}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#7b8cde] hover:text-[#a0b0ff]"
                  >
                    <Globe className="size-3" />
                    r/{game.reddit_subreddit}
                    <ExternalLink className="size-2.5 ml-auto" />
                  </a>
                )}
                {latestSnap?.reddit_members && (
                  <SidebarStat
                    label="社区成员"
                    value={compactNumber(latestSnap.reddit_members)}
                    icon={<Users className="size-3 text-[#5a6080]" />}
                  />
                )}
              </div>
            </section>
          ) : null}

          {/* Monthly review quick table */}
          {reviewMonthly.length > 0 && (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-4">
              <SectionHeader eyebrow="Monthly" title="近期评测" compact />
              <div className="mt-3 space-y-1">
                {reviewMonthly.slice(-6).reverse().map((item) => (
                  <div key={item.month} className="flex items-center justify-between rounded px-2 py-1.5 text-xs odd:bg-[#0f1220]">
                    <span className="font-mono text-[#5a6080]">{item.month?.slice(0, 7)}</span>
                    <span className="font-mono text-[#c0c8e0]">{compactNumber(item.new_reviews)}</span>
                    {item.positive_rate != null && (
                      <span className={`font-mono text-[12px] ${item.positive_rate >= 0.8 ? "text-emerald-400" : item.positive_rate >= 0.6 ? "text-[#7b8cde]" : "text-rose-400"}`}>
                        {item.positive_rate != null ? (item.positive_rate > 1 ? Math.round(item.positive_rate) : Math.round(item.positive_rate * 100)) : 0}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Similar games */}
          {similar.length > 0 && (
            <section className="rounded-xl border border-[#2a2d3e] bg-[#12152b] p-4">
              <SectionHeader eyebrow="Similar" title="同级游戏" compact />
              <div className="mt-3 space-y-2">
                {similar.map((item) => {
                  const img = item.cover_image || steamCover(item.steam_appid);
                  return (
                    <Link
                      key={item.id}
                      href={`/games/${item.id}`}
                      className="flex items-center gap-2.5 rounded-lg p-1.5 transition hover:bg-[#1c1f35]"
                    >
                      <div className="aspect-[16/9] w-16 shrink-0 overflow-hidden rounded bg-[#0b0e16]">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-medium text-[#c0c8e0] leading-snug">{item.name}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <RatingBadge rating={item.rating} className="text-[9px] px-1 py-0" />
                          <span className="font-mono text-[12px] text-[#5a6080]">{compactNumber(item.followers)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  compact,
}: {
  eyebrow: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="text-[12px] uppercase tracking-[0.18em] text-[#7b8cde]">{eyebrow}</div>
      <h2 className={`mt-0.5 font-semibold text-[#e0e4f0] ${compact ? "text-sm" : "text-base"}`}>{title}</h2>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[12px] uppercase tracking-wider text-[#4a5070]">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold ${valueClass ?? "text-[#e0e4f0]"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[12px] text-[#5a6080]">{sub}</div>}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number | null | undefined;
  max: number;
}) {
  const pct = Math.min(100, ((Number(value) || 0) / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#7a8099]">{label}</span>
        <span className="font-mono text-[#a0a8c0]">{value != null ? value.toFixed(2) : "—"}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#1c1f35]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4a5aac] to-[#7b8cde] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LanguageBars({ dist }: { dist: Record<string, number> }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(dist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const langNames: Record<string, string> = {
    english: "英语",
    schinese: "简中",
    tchinese: "繁中",
    russian: "俄语",
    german: "德语",
    french: "法语",
    spanish: "西班牙语",
    portuguese: "葡萄牙语",
    japanese: "日语",
    koreana: "韩语",
    italian: "意大利语",
    polish: "波兰语",
    turkish: "土耳其语",
    brazilian: "巴西葡语",
  };

  const colors = [
    "#7b8cde",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#a78bfa",
    "#60a5fa",
    "#fb923c",
    "#e879f9",
  ];

  return (
    <div className="mt-4 space-y-2">
      {sorted.map(([lang, count], i) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={lang}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#a0a8c0]">{langNames[lang] ?? lang}</span>
              <span className="font-mono text-[#5a6080]">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1f35]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SidebarStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-[#7a8099]">
        {icon}
        {label}
      </span>
      <span className="font-mono text-[#c0c8e0]">{value}</span>
    </div>
  );
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const colors: Record<string, string> = {
    strongly_positive: "bg-emerald-400",
    positive: "bg-teal-400",
    mixed: "bg-amber-400",
    negative: "bg-orange-400",
    strongly_negative: "bg-rose-400",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[sentiment] ?? "bg-[#4a5070]"}`} />
  );
}

// ─── Review topics three-column grid ─────────────────────────────────────────

import type { ReviewTopic, ReviewSentiment } from "@/lib/api";

const POS_SENTIMENTS = new Set<ReviewSentiment>(["strongly_positive", "positive"]);
const NEG_SENTIMENTS = new Set<ReviewSentiment>(["negative", "strongly_negative"]);

const SENTIMENT_LABEL: Record<ReviewSentiment, string> = {
  strongly_positive: "强烈好评",
  positive: "好评",
  mixed: "褒贬不一",
  negative: "差评",
  strongly_negative: "强烈差评",
};

const SENTIMENT_COLOR: Record<ReviewSentiment, string> = {
  strongly_positive: "#52c41a",
  positive: "#7cdb6a",
  mixed: "#ffc53d",
  negative: "#ff7a45",
  strongly_negative: "#ff4d4f",
};

function TopicCard({ topic }: { topic: ReviewTopic }) {
  const color = SENTIMENT_COLOR[topic.sentiment] ?? "#888";
  return (
    <article className="rounded-lg border border-[#1e2235] bg-[#0f1220] p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {SENTIMENT_LABEL[topic.sentiment]}
        </span>
        <span className="text-[12px] font-semibold" style={{ color }}>
          {topic.pct}%
        </span>
      </div>
      <h3 className="text-[13px] font-semibold text-[#d9def0]">{topic.title}</h3>
      <p className="mt-1.5 text-[12px] leading-[1.6] text-[#7a8099]">{topic.description}</p>
      {/* Progress bar */}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#1c1f35]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(topic.pct, 100)}%`, backgroundColor: color }}
        />
      </div>
    </article>
  );
}

function ReviewTopicsGrid({ topics }: { topics: ReviewTopic[] }) {
  const pos = topics.filter((t) => POS_SENTIMENTS.has(t.sentiment)).sort((a, b) => b.pct - a.pct);
  const mix = topics.filter((t) => t.sentiment === "mixed").sort((a, b) => b.pct - a.pct);
  const neg = topics.filter((t) => NEG_SENTIMENTS.has(t.sentiment)).sort((a, b) => b.pct - a.pct);

  const Col = ({
    dot,
    label,
    items,
  }: {
    dot: string;
    label: string;
    items: ReviewTopic[];
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 pb-1">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
        <span className="text-[12px] font-semibold text-[#a0a8c0]">{label}</span>
        <span className="ml-auto text-[11px] text-[#5a6080]">{items.length} 项</span>
      </div>
      {items.length > 0 ? (
        items.map((t) => <TopicCard key={t.title} topic={t} />)
      ) : (
        <p className="rounded-lg border border-dashed border-[#1e2235] py-4 text-center text-[12px] text-[#4a5070]">
          暂无
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <Col dot="#52c41a" label="好评" items={pos} />
      <Col dot="#ffc53d" label="褒贬不一" items={mix} />
      <Col dot="#ff4d4f" label="差评" items={neg} />
    </div>
  );
}
