"use client";

import Link from "next/link";

import { DashboardCard } from "@/components/dashboard-card";
import { clearWatchlist, useWatchlistIds } from "@/lib/watchlist";
import type { Game } from "@/lib/api";

export function WatchlistView({ games }: { games: Game[] }) {
  const ids = useWatchlistIds();
  const idSet = new Set(ids);
  const savedGames = games
    .filter((game) => idSet.has(game.id))
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#7b8cde]">Local Watchlist</div>
            <h1 className="mt-1 text-2xl font-semibold text-[#e0e4f0]">我的收藏</h1>
            <p className="mt-1 text-sm text-[#7a8099]">
              收藏保存在当前浏览器，不需要登录，也不会上传到服务器。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#0f1117] px-3 py-1 text-sm text-[#9aa8ff]">
              {savedGames.length} 款
            </span>
            {savedGames.length > 0 && (
              <button
                type="button"
                onClick={clearWatchlist}
                className="rounded-full border border-[#2a2d3e] px-3 py-1 text-sm text-[#8a91aa] transition hover:border-rose-400/70 hover:text-rose-300"
              >
                清空
              </button>
            )}
          </div>
        </div>
      </div>

      {savedGames.length > 0 ? (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {savedGames.map((game) => (
            <DashboardCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-[#2a2d3e] bg-[#11141f] p-6 text-center">
          <div>
            <div className="text-lg font-semibold text-[#dce2f4]">还没有收藏游戏</div>
            <p className="mt-2 max-w-md text-sm text-[#7a8099]">
              在主看板、待定发售日或搜索结果里点收藏按钮，就可以把候选游戏临时放到这里。
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-full border border-[#7b8cde]/60 px-4 py-2 text-sm text-[#b7c2ff] transition hover:bg-[#7b8cde]/15"
            >
              返回主看板
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
