"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { RatingBadge } from "@/components/rating-badge";
import type { Game } from "@/lib/api";
import { compactNumber } from "@/lib/format";

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
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
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery("");
      setResults([]);
      setCursor(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data: Game[] = await res.json();
        setResults(data);
        setCursor(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [query]);

  const close = () => setOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(results.length, 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    }
    if (e.key === "Enter" && results[cursor]) {
      router.push(`/games/${results[cursor].id}`);
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
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索游戏名、开发商…"
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-[#e0e4f0] placeholder:text-[#5a6080] outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
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
                <div className="px-4 py-8 text-center text-sm text-[#5a6080]">
                  输入游戏名开始搜索
                </div>
              ) : loading ? (
                <div className="px-4 py-8 text-center text-sm text-[#5a6080]">搜索中…</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#5a6080]">
                  没有找到「{query}」相关游戏
                </div>
              ) : (
                <>
                  <ul className="max-h-80 overflow-y-auto">
                    {results.map((g, i) => (
                      <li key={g.id}>
                        <Link
                          href={`/games/${g.id}`}
                          onClick={close}
                          className={`flex items-center gap-3 px-4 py-2.5 transition ${
                            i === cursor ? "bg-[#1c2245]" : "hover:bg-[#191c33]"
                          }`}
                        >
                          {/* Cover */}
                          {g.cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={g.cover_image}
                              alt=""
                              loading="lazy"
                              className="h-9 w-16 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="grid h-9 w-16 shrink-0 place-items-center rounded bg-[#0b0e16] text-xs text-[#5a6080]">
                              {g.name[0]}
                            </div>
                          )}

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-[#e0e4f0]">
                              {g.name}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#5a6080]">
                              {g.developer && (
                                <span className="truncate max-w-[160px]">{g.developer}</span>
                              )}
                              {g.release_date && (
                                <span className="shrink-0">{g.release_date.slice(0, 4)}</span>
                              )}
                            </div>
                          </div>

                          {/* Rating + followers */}
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <RatingBadge rating={g.rating} className="text-[10px] px-1.5 py-0" />
                            {g.followers != null && (
                              <span className="text-[11px] text-[#5a6080]">
                                {compactNumber(g.followers)}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>

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
