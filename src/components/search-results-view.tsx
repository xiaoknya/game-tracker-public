"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardCard } from "@/components/dashboard-card";
import { ReleasedCard } from "@/components/released-card";
import type { Game, ReleasedGame } from "@/lib/api";

const RATINGS = ["S", "A", "B", "C"] as const;
type Rating = (typeof RATINGS)[number];

const SORT_OPTIONS = [
  { key: "relevance", label: "匹配度" },
  { key: "score", label: "综合分" },
  { key: "followers", label: "关注数" },
  { key: "date", label: "发售日" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const RATING_ACTIVE: Record<Rating, string> = {
  S: "border-rose-400 bg-rose-400 text-[#0f1117]",
  A: "border-amber-300 bg-amber-300 text-[#0f1117]",
  B: "border-sky-400 bg-sky-400 text-[#0f1117]",
  C: "border-[#a0a8c8] bg-[#a0a8c8] text-[#0f1117]",
};

const CHIP_INACTIVE = "border-[#2a2d3e] bg-transparent text-[#a0a8c0] hover:bg-[#202437]";

export function SearchResultsView({
  query,
  games,
  hotGames,
}: {
  query: string;
  games: Game[];
  hotGames: Game[];
}) {
  const [selectedRatings, setSelectedRatings] = useState<Set<Rating>>(new Set());
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const sourceGames = query.trim() ? games : hotGames;

  const filtered = useMemo(() => {
    const items = sourceGames
      .map((game, index) => ({ game, index }))
      .filter(({ game }) => {
        if (selectedRatings.size === 0) return true;
        return Boolean(game.rating && selectedRatings.has(game.rating as Rating));
      });

    return items
      .sort((a, b) => {
        if (sortBy === "score") return (b.game.total_score ?? -Infinity) - (a.game.total_score ?? -Infinity);
        if (sortBy === "followers") return (b.game.followers ?? -Infinity) - (a.game.followers ?? -Infinity);
        if (sortBy === "date") return (a.game.days_to_release ?? 99999) - (b.game.days_to_release ?? 99999);
        return a.index - b.index;
      })
      .map(({ game }) => game);
  }, [selectedRatings, sortBy, sourceGames]);

  const ratingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    sourceGames.forEach((game) => counts.set(String(game.rating ?? "未评级"), (counts.get(String(game.rating ?? "未评级")) ?? 0) + 1));
    return counts;
  }, [sourceGames]);

  const toggleRating = (rating: Rating) => {
    setSelectedRatings((prev) => {
      const next = new Set(prev);
      if (next.has(rating)) next.delete(rating);
      else next.add(rating);
      return next;
    });
  };

  return (
    <section className="space-y-4">
      <form action="/search" className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-widest text-[#7b8cde]">Search</div>
            <h1 className="mt-1 text-2xl font-semibold text-[#e0e4f0]">
              {query ? `搜索「${query}」` : "搜索游戏"}
            </h1>
            <p className="mt-1 text-sm text-[#7a8099]">
              {query
                ? `找到 ${games.length} 个候选结果，可按评级与热度继续收窄。`
                : "输入关键词查找游戏；没有关键词时展示近期高评级候选。"}
            </p>
          </div>

          <div className="flex min-w-0 gap-2 sm:min-w-[420px]">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5a6080]" />
              <input
                name="q"
                defaultValue={query}
                placeholder="搜索游戏名、开发商..."
                className="h-10 w-full rounded-lg border border-[#2a2d3e] bg-[#0f1117] pl-9 pr-3 text-sm text-[#e0e4f0] outline-none transition placeholder:text-[#5a6080] focus:border-[#7b8cde]/70"
              />
            </label>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-lg bg-[#7b8cde] px-4 text-sm font-medium text-white transition hover:bg-[#8fa0ff]"
            >
              搜索
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-xl border border-[#2a2d3e] bg-[#11141f]">
        <div className="flex flex-col gap-3 border-b border-[#2a2d3e] bg-[#1a1d2e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#e0e4f0]">{query ? "结果列表" : "近期推荐"}</span>
            <span className="rounded-full bg-[#0f1117] px-2 py-0.5 text-xs text-[#7b8cde]">{filtered.length}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="h-7 rounded-full border border-[#2a2d3e] bg-[#0f1117] px-3 text-xs text-[#c9d0e8] outline-none transition hover:border-[#7b8cde]/60"
              aria-label="排序方式"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  按{option.label}
                </option>
              ))}
            </select>

            {RATINGS.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => toggleRating(rating)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedRatings.has(rating) ? RATING_ACTIVE[rating] : CHIP_INACTIVE
                }`}
              >
                {rating}
                <span className="ml-1 opacity-70">{ratingCounts.get(rating) ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {filtered.length > 0 ? (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
              {filtered.map((game) => (
                isReleasedResult(game) ? (
                  <ReleasedCard key={game.id} game={game} />
                ) : (
                  <DashboardCard key={game.id} game={game} />
                )
              ))}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-center">
              <div>
                <div className="text-lg font-semibold text-[#dce2f4]">没有找到匹配结果</div>
                <p className="mt-2 text-sm text-[#7a8099]">可以换一个中文名、英文名或开发商关键词再试。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function isReleasedResult(game: Game): game is ReleasedGame {
  return (
    "steam_review_total" in game ||
    "steam_review_positive" in game ||
    "steam_review_score_desc" in game ||
    "steam_median_playtime" in game
  );
}
