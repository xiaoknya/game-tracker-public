import Link from "next/link";

import type { Game } from "@/lib/api";
import { steamCover } from "@/lib/api";
import { compactNumber, releaseDate, score, signedCompact, tagsFromGame } from "@/lib/format";
import { RatingBadge } from "@/components/rating-badge";

export function DashboardCard({ game }: { game: Game }) {
  const image = game.cover_image || steamCover(game.steam_appid);
  const tags = tagsFromGame(game, 3);
  const delta = game.followers_7d_delta ?? 0;

  return (
    <Link
      href={`/games/${game.id}`}
      className="group block overflow-hidden rounded-xl border border-[#2a2d3e] bg-[#12152b] shadow-[0_8px_32px_rgba(2,6,23,0.5)] transition-all duration-200 hover:-translate-y-1 hover:border-[#4a527b] hover:shadow-[0_20px_48px_rgba(2,6,23,0.7)]"
    >
      {/* ── Image with gradient overlay ── */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0b0e16]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#3a3d55] text-sm">No image</span>
          </div>
        )}

        {/* Bottom gradient — strong enough for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12152b] via-[#12152b]/20 to-transparent" />

        {/* Top-left: Rating badge */}
        <div className="absolute left-2.5 top-2.5">
          <RatingBadge rating={game.rating} />
        </div>

        {/* Top-right: Follower count pill */}
        {game.followers != null && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono text-white/80 backdrop-blur-sm">
            {compactNumber(game.followers)}
          </div>
        )}

        {/* Bottom overlay: game name */}
        <div className="absolute inset-x-0 bottom-0 p-3 pb-2">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-[1.4] text-white drop-shadow-sm">
            {game.name}
          </h3>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-3 pb-3 pt-2">
        {/* Developer / Publisher */}
        {game.developer ? (
          <p className="truncate text-[11px] text-[#5a6080]">{game.developer}</p>
        ) : (
          <p className="h-[15px]" />
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-[#1c1f35] px-1.5 py-0.5 text-[10px] text-[#5a6080]">
                {tag}
              </span>
            ))}
            {game.is_free ? (
              <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                免费
              </span>
            ) : null}
          </div>
        )}

        {/* ── Metrics grid ── */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <MetricBox label="7日增量" value={signedCompact(delta)} positive={delta > 0} negative={delta < 0} />
          <MetricBox label="发售日" value={releaseDate(game.release_date, game.release_date_is_fuzzy)} />
          <MetricBox label="综合分" value={score(game.total_score)} accent />
        </div>
      </div>
    </Link>
  );
}

function MetricBox({
  label,
  value,
  positive,
  negative,
  accent,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  accent?: boolean;
}) {
  const valueColor = positive
    ? "text-emerald-400"
    : negative
      ? "text-rose-400"
      : accent
        ? "text-[#7b8cde]"
        : "text-[#c0c8e0]";

  return (
    <div className="rounded-md bg-[#0f1220] px-2 py-2">
      <div className="text-[9px] uppercase tracking-wide text-[#4a5070]">{label}</div>
      <div className={`mt-0.5 truncate font-mono text-[12px] font-medium ${valueColor}`}>{value}</div>
    </div>
  );
}
