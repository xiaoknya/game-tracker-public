"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

import { toggleWatchlist, useWatchlistIds } from "@/lib/watchlist";

export function WatchlistButton({
  gameId,
  className = "",
  compact = false,
}: {
  gameId: number;
  className?: string;
  compact?: boolean;
}) {
  const ids = useWatchlistIds();
  const active = ids.includes(gameId);
  const Icon = active ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "取消收藏" : "加入收藏"}
      title={active ? "取消收藏" : "加入收藏"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWatchlist(gameId);
      }}
      className={`inline-flex items-center justify-center rounded-md border transition ${
        active
          ? "border-[#8fa0ff]/70 bg-[#7b8cde]/20 text-[#b7c2ff]"
          : "border-white/15 bg-[#0b0e16]/70 text-[#8b92ad] hover:border-[#7b8cde]/60 hover:text-[#b7c2ff]"
      } ${compact ? "size-8" : "gap-1.5 px-2.5 py-1 text-xs"} ${className}`}
    >
      <Icon className={compact ? "size-4" : "size-3.5"} />
      {!compact && <span>{active ? "已收藏" : "收藏"}</span>}
    </button>
  );
}
