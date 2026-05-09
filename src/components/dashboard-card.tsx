import Link from "next/link";
import { ExternalLink } from "lucide-react";

import type { Game } from "@/lib/api";
import { steamCover } from "@/lib/api";
import { compactNumber, releaseDate, score, signedCompact, tagsFromGame } from "@/lib/format";
import { RatingBadge } from "@/components/rating-badge";

const ratingGlow: Record<string, string> = {
  S: "hover:border-rose-400/50 hover:shadow-[0_8px_28px_color-mix(in_srgb,#fb7185_22%,transparent)]",
  A: "hover:border-amber-400/50 hover:shadow-[0_8px_28px_color-mix(in_srgb,#fbbf24_22%,transparent)]",
  B: "hover:border-sky-400/50  hover:shadow-[0_8px_28px_color-mix(in_srgb,#38bdf8_22%,transparent)]",
  C: "hover:border-zinc-500/50 hover:shadow-[0_8px_28px_color-mix(in_srgb,#a1a1aa_14%,transparent)]",
};

export function DashboardCard({ game }: { game: Game }) {
  const image = game.cover_image || steamCover(game.steam_appid);
  const tags = tagsFromGame(game, 3);
  const delta = game.followers_7d_delta ?? 0;
  const glowClass = ratingGlow[String(game.rating ?? "")] ?? "hover:border-[#4a527b]";

  return (
    <Link
      href={`/games/${game.id}`}
      className={`group block overflow-hidden rounded-xl border border-[#2a2d3e] bg-[#12152b] shadow-[0_6px_24px_rgba(2,6,23,0.45)] transition-all duration-200 hover:-translate-y-0.5 ${glowClass}`}
    >
      {/* ── Cover image — outer card's overflow-hidden handles clipping ── */}
      <div
        className="relative bg-[#12152b]"
        style={{ height: "158px" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="block h-full w-full object-cover transition duration-300 will-change-transform group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#3a3d55]">No image</div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#12152b] to-transparent" />
      </div>

      {/* ── Card body ── */}
      <div className="px-3.5 pb-3.5 pt-2.5">
        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-[15px] font-semibold leading-[1.4] text-[#e0e4f0]">
            {game.name}
          </h3>
          <div className="shrink-0 pt-0.5">
            <RatingBadge rating={game.rating} className="h-6 min-w-7 rounded px-1.5 text-xs" />
          </div>
        </div>

        {/* Meta: release date + countdown */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#5a6080]">
          <span>📅 {releaseDate(game.release_date, game.release_date_is_fuzzy)}</span>
          {game.days_to_release != null && game.days_to_release > 0 && (
            <span className="text-[#7b8cde]">（{game.days_to_release} 天后）</span>
          )}
          {game.score_date && (
            <span className="italic">评分: {game.score_date}</span>
          )}
        </div>

        {/* Stats 3-col */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <StatBox label="Followers" value={compactNumber(game.followers)} />
          <StatBox label="7日增量" value={signedCompact(delta)} positive={delta > 0} negative={delta < 0} />
          <StatBox label="综合分" value={score(game.total_score)} accent />
        </div>

        {/* External quick links */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {game.steamdb_url && <ExtLink href={game.steamdb_url} label="SteamDB" />}
          {game.steam_url   && <ExtLink href={game.steam_url}   label="Steam"   />}
          <ExtLink
            href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(game.name)}`}
            label="B站"
          />
        </div>

        {/* Tags */}
        {(tags.length > 0 || game.is_free || game.modifier_adaptation_required) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {game.is_free && (
              <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[11px] text-emerald-400">Free</span>
            )}
            {game.modifier_adaptation_required && (
              <span className="rounded bg-red-400/10 px-1.5 py-0.5 text-[11px] text-red-400">需要修改器</span>
            )}
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-[#1c1f35] px-1.5 py-0.5 text-[11px] text-[#5a6080]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function StatBox({
  label, value, positive, negative, accent,
}: {
  label: string; value: string; positive?: boolean; negative?: boolean; accent?: boolean;
}) {
  const valueColor = positive ? "text-emerald-400" : negative ? "text-rose-400" : accent ? "text-[#7b8cde]" : "text-[#c0c8e0]";
  return (
    <div className="rounded-md bg-[#0f1220] px-2 py-2 text-center">
      <div className="text-[11px] text-[#3e4460]">{label}</div>
      <div className={`mt-0.5 font-mono text-[14px] font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-0.5 rounded border border-[#2a2d3e] bg-[#0f1220] px-2 py-0.5 text-[11px] text-[#5a6080] transition hover:border-[#7b8cde]/50 hover:text-[#7b8cde]"
    >
      {label} <ExternalLink className="size-2.5" />
    </a>
  );
}
