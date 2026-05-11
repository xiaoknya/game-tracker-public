"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { RatingBadge } from "@/components/rating-badge";
import { WatchlistButton } from "@/components/watchlist-button";
import type { Game } from "@/lib/api";
import { compactNumber, releaseDate } from "@/lib/format";

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [hotGames, setHotGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: / to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && !open && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Auto-focus on open; reset on close
  useEffect(() => {
    if (!open) return;
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    if (!open || hotGames.length > 0) return;
    let ignore = false;
    fetch("/api/search?hot=1&limit=8")
      .then((res) => res.json())
      .then((data: Game[]) => {
        if (!ignore) setHotGames(data);
      })
      .catch(() => {
        if (!ignore) setHotGames([]);
      });
    return () => {
      ignore = true;
    };
  }, [hotGames.length, open]);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      return;
    }
    let ignore = false;
    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data: Game[] = await res.json();
        if (!ignore) {
          setResults(data);
          setCursor(0);
        }
      } catch {
        if (!ignore) setResults([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setCursor(0);
    setLoading(false);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setCursor(0);
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  const activeList = query.trim() ? results : hotGames;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(activeList.length, 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + Math.max(activeList.length, 1)) % Math.max(activeList.length, 1));
    }
    if (e.key === "Enter" && activeList[cursor]) {
      router.push(`/games/${activeList[cursor].id}`);
      close();
    }
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/10 hover:text-white/80"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden rounded bg-white/10 px-1 py-0.5 text-[10px] leading-none sm:inline">
          /
        </kbd>
      </button>

      {/* ── Dialog ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <div className="fixed left-1/2 top-20 z-50 w-full max-w-lg -translate-x-1/2 px-4">
            <div className="overflow-hidden rounded-xl border border-[#2a2d3e] bg-[#12152b] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">

              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="size-4 shrink-0 text-[#5a6080]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索游戏名、开发商…"
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-[#e0e4f0] placeholder:text-[#5a6080] outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => updateQuery("")}
                    className="text-[#5a6080] transition hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-[#5a6080]">
                    Esc
                  </kbd>
                )}
              </div>

              <div className="border-t border-[#1e2235]" />

              {/* Body */}
              {!query.trim() ? (
                <SearchList
                  games={hotGames}
                  cursor={cursor}
                  close={close}
                  heading="近期 S/A 级"
                  empty="输入游戏名开始搜索"
                />
              ) : loading ? (
                <div className="px-4 py-8 text-center text-sm text-[#5a6080]">搜索中…</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#5a6080]">
                  没有找到「{query}」相关游戏
                </div>
              ) : (
                <>
                  <SearchList games={results} cursor={cursor} close={close} heading="搜索结果" />

                  {/* Footer hint */}
                  <div className="flex items-center gap-4 border-t border-[#1e2235] px-4 py-2 text-[11px] text-[#4a5070]">
                    <span>↑↓ 选择</span>
                    <span>Enter 跳转</span>
                    <span>Esc 关闭</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SearchList({
  games,
  cursor,
  close,
  heading,
  empty,
}: {
  games: Game[];
  cursor: number;
  close: () => void;
  heading: string;
  empty?: string;
}) {
  if (games.length === 0) {
    return <div className="px-4 py-8 text-center text-sm text-[#5a6080]">{empty ?? "暂无推荐"}</div>;
  }

  return (
    <div>
      <div className="px-4 py-2 text-[11px] uppercase tracking-widest text-[#5a6080]">{heading}</div>
      <ul className="max-h-80 overflow-y-auto">
        {games.map((g, i) => (
          <li key={g.id} className={i === cursor ? "bg-[#1c2245]" : "hover:bg-[#191c33]"}>
            <div className="flex items-center gap-3 px-4 py-2.5 transition">
              <Link href={`/games/${g.id}`} onClick={close} className="contents">
                {g.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.cover_image}
                    alt=""
                    loading="lazy"
                    className="h-10 w-[72px] shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="grid h-10 w-[72px] shrink-0 place-items-center rounded bg-[#0b0e16] text-xs text-[#5a6080]">
                    {g.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[#e0e4f0]">{g.name}</div>
                  <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-[#5a6080]">
                    {g.developer && <span className="truncate max-w-[140px]">{g.developer}</span>}
                    <span className="shrink-0">{releaseDate(g.release_date, g.release_date_is_fuzzy)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <RatingBadge rating={g.rating} className="text-[10px] px-1.5 py-0" />
                  {g.followers != null && (
                    <span className="text-[11px] text-[#5a6080]">{compactNumber(g.followers)}</span>
                  )}
                </div>
              </Link>
              <WatchlistButton gameId={g.id} compact />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
