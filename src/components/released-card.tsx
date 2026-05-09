import Link from "next/link";

import type { ReleasedGame, ReviewSentiment, ReviewTopic } from "@/lib/api";
import { steamCover } from "@/lib/api";
import { tagsFromGame } from "@/lib/format";
import { RatingBadge } from "@/components/rating-badge";

// ─── Flag emoji map ───────────────────────────────────────────────────────────
const LANG_FLAG: Record<string, string> = {
  english: "🇺🇸", schinese: "🇨🇳", tchinese: "🇹🇼",
  russian: "🇷🇺", koreana: "🇰🇷", brazilian: "🇧🇷",
  french: "🇫🇷", german: "🇩🇪", spanish: "🇪🇸",
  japanese: "🇯🇵", polish: "🇵🇱", turkish: "🇹🇷",
  italian: "🇮🇹", portuguese: "🇵🇹", dutch: "🇳🇱",
  latam: "🇲🇽", czech: "🇨🇿", hungarian: "🇭🇺",
  romanian: "🇷🇴", thai: "🇹🇭", ukrainian: "🇺🇦",
  greek: "🇬🇷", danish: "🇩🇰", finnish: "🇫🇮",
  norwegian: "🇳🇴", swedish: "🇸🇪", bulgarian: "🇧🇬",
};

// ─── Sentiment ───────────────────────────────────────────────────────────────
function sentimentColor(s: ReviewSentiment): string {
  return {
    strongly_positive: "#52c41a",
    positive: "#95de64",
    mixed: "#ffc53d",
    negative: "#ff7a45",
    strongly_negative: "#ff4d4f",
  }[s] ?? "#888";
}

function sentimentEmoji(s: ReviewSentiment): string {
  return {
    strongly_positive: "♥",
    positive: "👍",
    mixed: "〰",
    negative: "👎",
    strongly_negative: "⚠",
  }[s] ?? "•";
}

// ─── Rating hover glow ────────────────────────────────────────────────────────
const ratingGlow: Record<string, string> = {
  S: "hover:border-rose-400/50 hover:shadow-[0_8px_28px_color-mix(in_srgb,#fb7185_20%,transparent)]",
  A: "hover:border-amber-400/50 hover:shadow-[0_8px_28px_color-mix(in_srgb,#fbbf24_20%,transparent)]",
  B: "hover:border-sky-400/50  hover:shadow-[0_8px_28px_color-mix(in_srgb,#38bdf8_20%,transparent)]",
  C: "hover:border-zinc-500/50 hover:shadow-[0_8px_28px_color-mix(in_srgb,#a1a1aa_12%,transparent)]",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ReleasedCard({ game }: { game: ReleasedGame }) {
  const image = game.cover_image || steamCover(game.steam_appid);
  const tags = tagsFromGame(game, 3);
  const glowClass = ratingGlow[String(game.rating ?? "")] ?? "hover:border-[#4a527b]";

  // Review stats
  const positiveRate =
    game.steam_review_total && game.steam_review_positive
      ? Math.round((game.steam_review_positive / game.steam_review_total) * 100)
      : null;

  const reviewBarColor =
    positiveRate == null ? "#555"
    : positiveRate >= 80  ? "#1bbf7c"
    : positiveRate >= 60  ? "#e6a23c"
    : "#f56c6c";

  // Playtime
  const playtime = game.steam_median_playtime;
  const playtimeLabel = playtime
    ? playtime < 60 ? `${playtime}m`
      : playtime % 60 === 0 ? `${playtime / 60}h`
      : `${(playtime / 60).toFixed(1)}h`
    : null;

  // AI topics (top 3)
  const topTopics: ReviewTopic[] = (game.review_topics ?? []).slice(0, 3);

  // Language dist (top 3) — values may be counts or already percentages
  const topLangs = (() => {
    if (!game.language_dist) return [];
    const entries = Object.entries(game.language_dist).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return entries.slice(0, 3).map(([code, v]) => ({
      code,
      pct: total > 0 ? Math.round((v / total) * 100) : Math.round(v),
    }));
  })();

  function fmtCount(n: number | null | undefined) {
    if (!n) return "";
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  }

  return (
    <Link
      href={`/games/${game.id}`}
      className={`group block cursor-pointer rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-3 shadow-[0_6px_20px_rgba(2,6,23,0.3)] transition-all duration-200 hover:-translate-y-[3px] ${glowClass}`}
    >
      {/* ── Cover with negative margins — same bleed technique as GameCard ── */}
      <div className="-mx-3 -mt-3 mb-2.5 overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0b0e16] to-[#0f1117] relative" style={{ aspectRatio: "460/215" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="block h-full w-full object-cover transition duration-300 will-change-transform group-hover:scale-[1.04]"
          />
        ) : null}
        {/* Rating badge top-left */}
        <div className="absolute left-2 top-2">
          <RatingBadge rating={game.rating} className="h-6 min-w-7 rounded px-1.5 text-xs" />
        </div>
        {/* Playtime badge top-right */}
        {playtimeLabel && (
          <div className="absolute right-2 top-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[13px] font-bold text-white backdrop-blur-sm">
            {playtimeLabel}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div>
        {/* Game name */}
        <h3 className="line-clamp-1 text-[14px] font-bold text-[#e0e4f0]">{game.name}</h3>

        {/* ── Good-rate bar ── */}
        {positiveRate != null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0b0e16]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${positiveRate}%`, backgroundColor: reviewBarColor }}
              />
            </div>
            <span className="shrink-0 text-[13px] font-bold" style={{ color: reviewBarColor }}>
              {positiveRate}% Positive
            </span>
            <span className="shrink-0 text-[13px] text-[#4a5070]">
              {fmtCount(game.steam_review_total)}
            </span>
          </div>
        )}

        {/* Genre tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[#2a2d3e] bg-[#0b0e16] px-1.5 py-0.5 text-[13px] text-[#5a6080]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── AI topics ── */}
        {topTopics.length > 0 && (
          <div className="mt-2.5 space-y-1.5 border-t border-[#0b0e16] pt-2.5">
            {topTopics.map((topic) => (
              <div key={topic.title} className="grid items-center gap-x-1.5" style={{ gridTemplateColumns: "16px 1fr 52px 30px" }}>
                {/* Sentiment icon */}
                <span
                  className="text-center text-[13px] leading-none"
                  style={{ color: sentimentColor(topic.sentiment) }}
                >
                  {sentimentEmoji(topic.sentiment)}
                </span>
                {/* Topic name */}
                <span className="truncate text-[13px] text-[#a0a8c0]">{topic.title}</span>
                {/* Mini bar */}
                <div className="h-1 overflow-hidden rounded-full bg-[#0b0e16]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(topic.pct * 4, 100)}%`,
                      backgroundColor: sentimentColor(topic.sentiment),
                    }}
                  />
                </div>
                {/* Pct */}
                <span className="text-right font-mono text-[13px] text-[#4a5070]">~{topic.pct}%</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Language distribution ── */}
        {topLangs.length > 0 && (
          <div className="mt-2 flex gap-3 border-t border-[#0b0e16] pt-2">
            {topLangs.map(({ code, pct }) => (
              <span key={code} className="flex items-center gap-1 text-[13px] text-[#5a6080]">
                <span className="text-[13px]">{LANG_FLAG[code] ?? "🌐"}</span>
                ~{pct}%
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
