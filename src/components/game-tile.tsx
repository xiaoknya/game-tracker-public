import Link from "next/link";
import { ArrowUpRight, CalendarDays, Users } from "lucide-react";

import type { Game } from "@/lib/api";
import { steamCover } from "@/lib/api";
import { compactNumber, releaseDate, releaseStatus, score, signedCompact, tagsFromGame } from "@/lib/format";
import { RatingBadge } from "@/components/rating-badge";
import { cn } from "@/lib/utils";

export function GameTile({
  game,
  compact = false,
}: {
  game: Game;
  compact?: boolean;
}) {
  const image = game.cover_image || steamCover(game.steam_appid);
  const tags = tagsFromGame(game, compact ? 2 : 3);

  return (
    <Link
      href={`/games/${game.id}`}
      className={cn(
        "group grid gap-4 border-t border-white/10 py-5 transition duration-200 hover:border-teal-200/40",
        compact ? "grid-cols-[96px_1fr]" : "md:grid-cols-[180px_1fr]",
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-md bg-white/5",
          compact ? "aspect-[16/10]" : "aspect-[16/9]",
        )}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <RatingBadge rating={game.rating} />
              <span className="text-xs text-white/45">{releaseStatus(game)}</span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white transition group-hover:text-teal-100">
              {game.name}
            </h3>
          </div>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-white/30 transition group-hover:text-teal-200" />
        </div>

        {!compact ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
            {game.short_description || game.name_en || "暂无简介"}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {releaseDate(game.release_date, game.release_date_is_fuzzy)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {compactNumber(game.followers)}
          </span>
          <span className={cn("font-mono", (game.followers_7d_delta ?? 0) > 0 && "text-teal-200")}>
            7d {signedCompact(game.followers_7d_delta)}
          </span>
          <span>Score {score(game.total_score)}</span>
        </div>

        {tags.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-white/[0.06] px-2 py-1 text-[11px] text-white/50">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

