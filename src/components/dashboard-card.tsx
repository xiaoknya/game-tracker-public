import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { WatchlistButton } from "@/components/watchlist-button";
import { ReleaseDateChangeBadge } from "@/components/release-date-change-badge";
import { PriceBadge, hasDisplayablePrice } from "@/components/price-badge";
import type { Game, Rating } from "@/lib/api";
import { steamCover } from "@/lib/api";
import { compactNumber, releaseDate, score, signedCompact, tagsFromGame } from "@/lib/format";

const CORNER_GRADIENT: Record<string, [string, string]> = {
  S: ['rgba(225,29,72,0.92)', 'rgba(225,29,72,0)'],
  A: ['rgba(217,119,6,0.92)', 'rgba(217,119,6,0)'],
  B: ['rgba(2,132,199,0.92)', 'rgba(2,132,199,0)'],
  C: ['rgba(82,82,91,0.85)',  'rgba(82,82,91,0)'],
}

function CornerRating({ rating }: { rating: Rating }) {
  const [c1, c2] = CORNER_GRADIENT[String(rating ?? '')] ?? ['rgba(63,63,70,0.85)', 'rgba(63,63,70,0)']
  const size = 36
  return (
    <div className="absolute left-0 top-0 overflow-hidden rounded-tl-xl" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          background: `linear-gradient(135deg, ${c1} 30%, ${c2} 100%)`,
        }}
      />
      <span
        className="absolute left-[5px] top-[4px] text-[10px] font-black leading-none text-white"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        {String(rating ?? '—')}
      </span>
    </div>
  )
}

const ratingGlow: Record<string, string> = {
  S: "hover:border-rose-400/60 hover:shadow-[0_8px_24px_color-mix(in_srgb,#fb7185_22%,transparent)]",
  A: "hover:border-amber-400/60 hover:shadow-[0_8px_24px_color-mix(in_srgb,#fbbf24_22%,transparent)]",
  B: "hover:border-sky-400/60  hover:shadow-[0_8px_24px_color-mix(in_srgb,#38bdf8_22%,transparent)]",
  C: "hover:border-zinc-500/60 hover:shadow-[0_8px_24px_color-mix(in_srgb,#a1a1aa_14%,transparent)]",
};

export function DashboardCard({ game }: { game: Game }) {
  const image = game.cover_image || steamCover(game.steam_appid);
  const tags = tagsFromGame(game, 3);
  const delta = game.followers_7d_delta ?? 0;
  const glowClass = ratingGlow[String(game.rating ?? "")] ?? "hover:border-[#4a527b]";
  const isFree = Boolean(game.is_free);
  const hasPrice = hasDisplayablePrice(game.primary_price, isFree);

  return (
    <article
      className={`group block cursor-pointer rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-3 shadow-[0_6px_20px_rgba(2,6,23,0.3)] transition-all duration-200 hover:-translate-y-[3px] ${glowClass}`}
    >
      {/* ── Cover: aspect-ratio scales with card width ── */}
      <div className="-mx-3 -mt-3 mb-2.5 aspect-[2/1] overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0b0e16] to-[#0f1117] relative">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="block h-full w-full object-cover transition duration-300 will-change-transform group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#3a3d55]">No image</div>
        )}
        <Link
          href={`/games/${game.id}`}
          aria-label={`查看 ${game.name}`}
          className="absolute inset-0 z-10"
        />
        <CornerRating rating={game.rating} />
        <WatchlistButton
          gameId={game.id}
          compact
          className="absolute right-2 top-2 z-20 bg-[#0b0e16]/75 backdrop-blur"
        />
        {hasPrice && (
          <PriceBadge
            price={game.primary_price}
            compact
            hideWhenUnknown
            isFreeFallback={isFree}
            className="pointer-events-none absolute bottom-2 right-2 z-20 border-white/15 bg-[#05070d]/78 px-2 py-1 text-[11px] shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur"
          />
        )}
        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#1a1d2e] to-transparent" />
      </div>

      {/* ── Name ── */}
      <Link href={`/games/${game.id}`} className="block">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-[1.4] text-[#e0e4f0] transition group-hover:text-white">
          {game.name}
        </h3>
      </Link>

      {/* ── Meta ── */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[#7a8099]">
        <span className="flex shrink-0 items-center gap-0.5">
          📅 {releaseDate(game.release_date, game.release_date_is_fuzzy)}
        </span>
        {game.days_to_release != null && game.days_to_release > 0 && (
          <span className="shrink-0 text-[#7b8cde]">（{game.days_to_release}天）</span>
        )}
        <ReleaseDateChangeBadge event={game.latest_release_date_event} compact />
      </div>

      {/* ── Stats 3-col ── */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <StatBox label="Followers" value={compactNumber(game.followers)} />
        <StatBox label="7天增量"  value={signedCompact(delta)} positive={delta > 0} negative={delta < 0} />
        <StatBox label="综合分"   value={score(game.total_score)} accent />
      </div>

      {/* ── External links ── */}
      <div className="mt-2 flex flex-wrap gap-1">
        {game.steamdb_url && <ExtLink href={game.steamdb_url} label="SteamDB" />}
        {game.steam_url   && <ExtLink href={game.steam_url}   label="Steam" />}
        <ExtLink
          href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(game.name)}`}
          label="B站"
        />
      </div>

      {/* ── Tags ── */}
      {tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span key={tag} className="rounded bg-[#0b0e16] px-1.5 py-0.5 text-[11px] text-[#7a8099]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function StatBox({
  label, value, positive, negative, accent,
}: {
  label: string; value: string; positive?: boolean; negative?: boolean; accent?: boolean;
}) {
  const valueColor = positive
    ? "text-emerald-400"
    : negative ? "text-rose-400"
    : accent   ? "text-[#7b8cde]"
    : "text-[#c0c8e0]";
  return (
    <div className="rounded-md bg-[#0b0e16] p-1.5 text-center">
      <div className="text-[10px] text-[#5a6080]">{label}</div>
      <div className={`mt-0.5 font-mono text-[12px] font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-0.5 rounded border border-[#2a2d3e] bg-[#0b0e16] px-1.5 py-[2px] text-[11px] text-[#7a8099] transition hover:border-[#7b8cde]/60 hover:text-[#7b8cde]"
    >
      {label} <ExternalLink className="size-2.5 shrink-0" />
    </a>
  );
}
