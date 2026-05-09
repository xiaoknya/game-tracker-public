import Link from "next/link";
import { CalendarDays, Star, TrendingUp } from "lucide-react";

import type { Game } from "@/lib/api";
import { steamCover } from "@/lib/api";
import { compactNumber, releaseDate, score, signedCompact, tagsFromGame } from "@/lib/format";
import { RatingBadge } from "@/components/rating-badge";

export function DashboardCard({ game }: { game: Game }) {
  const image = game.cover_image || steamCover(game.steam_appid);
  const tags = tagsFromGame(game, 3);

  return (
    <Link
      href={`/games/${game.id}`}
      className="group block overflow-hidden rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] shadow-[0_10px_26px_rgba(2,6,23,0.3)] transition hover:-translate-y-0.5 hover:border-[#4a527b]"
    >
      <div className="relative aspect-[16/9] bg-[#0b0e16]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
        ) : null}
        <div className="absolute left-3 top-3">
          <RatingBadge rating={game.rating} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-[#e0e4f0]">
          {game.name}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-sm bg-[#0f1117] px-2 py-1 text-[11px] text-[#7a8099]">
              {tag}
            </span>
          ))}
          {game.is_free ? (
            <span className="rounded-sm bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-300">
              免费
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Metric icon={<Star className="size-3.5" />} label="关注" value={compactNumber(game.followers)} />
          <Metric
            icon={<TrendingUp className="size-3.5" />}
            label="7日"
            value={signedCompact(game.followers_7d_delta)}
            positive={(game.followers_7d_delta ?? 0) > 0}
          />
          <Metric icon={<CalendarDays className="size-3.5" />} label="发售" value={releaseDate(game.release_date, game.release_date_is_fuzzy)} />
          <Metric label="总分" value={score(game.total_score)} />
        </div>
      </div>
    </Link>
  );
}

function Metric({
  icon,
  label,
  value,
  positive,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-md bg-[#0f1117] px-2.5 py-2">
      <div className="flex items-center gap-1 text-[#5a6080]">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`mt-1 truncate font-mono text-[13px] ${positive ? "text-emerald-300" : "text-[#cbd3e8]"}`}>
        {value}
      </div>
    </div>
  );
}

