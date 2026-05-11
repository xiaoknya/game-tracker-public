'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { DashboardCard } from '@/components/dashboard-card'
import type { Game } from '@/lib/api'
import { tagsFromGame } from '@/lib/format'

// ─── Constants ────────────────────────────────────────────────────────────────
const RATINGS = ['S', 'A', 'B', 'C'] as const
type Rating = (typeof RATINGS)[number]

const DAY_OPTIONS = [7, 15, 30, 60]
const INITIAL = 12
const STEP = 12
const SORT_OPTIONS = [
  { key: 'score', label: '综合分' },
  { key: 'growth', label: '7天增长' },
  { key: 'followers', label: '关注数' },
  { key: 'date', label: '发售日' },
] as const
type SortKey = (typeof SORT_OPTIONS)[number]['key']
type PriceFilter = 'all' | 'free' | 'paid'

const RATING_ACTIVE: Record<Rating, string> = {
  S: 'border-rose-400 bg-rose-400 text-[#0f1117]',
  A: 'border-amber-300 bg-amber-300 text-[#0f1117]',
  B: 'border-sky-400 bg-sky-400 text-[#0f1117]',
  C: 'border-[#a0a8c8] bg-[#a0a8c8] text-[#0f1117]',
}
const CHIP_INACTIVE = 'border-[#2a2d3e] bg-transparent text-[#a0a8c0] hover:bg-[#202437]'
const CHIP_DAYS_ACTIVE = 'border-[#7b8cde] bg-[#7b8cde] text-white'

// ─── Component ────────────────────────────────────────────────────────────────
export function DashboardSection({
  allGames,
  selectedDays,
}: {
  allGames: Game[]
  selectedDays: number
}) {
  const [selected, setSelected] = useState<Set<Rating>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [visibleCount, setVisibleCount] = useState(INITIAL)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const toggle = (r: Rating) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(r)) next.delete(r)
      else next.add(r)
      return next
    })
    // Reset visible count when filter changes
    setVisibleCount(INITIAL)
  }

  const clearFilter = () => {
    setSelected(new Set())
    setSelectedTags(new Set())
    setPriceFilter('all')
    setVisibleCount(INITIAL)
  }

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>()
    allGames.forEach((game) => {
      tagsFromGame(game, 8).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    })
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))
  }, [allGames])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
    setVisibleCount(INITIAL)
  }

  const filtered = useMemo(() => {
    const games = allGames.filter((g) => {
      if (selected.size > 0 && (!g.rating || !selected.has(g.rating as Rating))) return false
      if (priceFilter === 'free' && !g.is_free) return false
      if (priceFilter === 'paid' && g.is_free) return false
      if (selectedTags.size > 0) {
        const tags = tagsFromGame(g, 12)
        if (!tags.some((tag) => selectedTags.has(tag))) return false
      }
      return true
    })

    return games.sort((a, b) => {
      if (sortBy === 'growth') return (b.followers_7d_delta ?? -Infinity) - (a.followers_7d_delta ?? -Infinity)
      if (sortBy === 'followers') return (b.followers ?? -Infinity) - (a.followers ?? -Infinity)
      if (sortBy === 'date') return (a.days_to_release ?? 99999) - (b.days_to_release ?? 99999)
      return (b.total_score ?? -Infinity) - (a.total_score ?? -Infinity)
    })
  }, [allGames, priceFilter, selected, selectedTags, sortBy])

  const visible = filtered.slice(0, visibleCount)
  const remaining = filtered.length - visibleCount
  const hasMore = remaining > 0
  const hasFilters = selected.size > 0 || selectedTags.size > 0 || priceFilter !== 'all'

  useEffect(() => {
    if (!hasMore) return
    const node = loadMoreRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setVisibleCount((count) => Math.min(count + STEP, filtered.length))
      },
      { rootMargin: '360px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [filtered.length, hasMore])

  return (
    <section className="mt-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 rounded-t-lg border border-[#2a2d3e] bg-[#1a1d2e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#e0e4f0]">即将发售</span>
          <span className="rounded-full bg-[#0f1117] px-2 py-0.5 text-xs text-[#7b8cde]">
            {filtered.length}
          </span>
          {hasFilters && (
            <span className="text-xs text-[#5a6080]">/ 共 {allGames.length}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as SortKey)
              setVisibleCount(INITIAL)
            }}
            className="h-7 rounded-full border border-[#2a2d3e] bg-[#0f1117] px-3 text-xs text-[#c9d0e8] outline-none transition hover:border-[#7b8cde]/60"
            aria-label="排序方式"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                按{option.label}
              </option>
            ))}
          </select>

          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggle(r)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                selected.has(r) ? RATING_ACTIVE[r] : CHIP_INACTIVE
              }`}
            >
              {r}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setPriceFilter(priceFilter === 'free' ? 'all' : 'free')
              setVisibleCount(INITIAL)
            }}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              priceFilter === 'free' ? 'border-emerald-400 bg-emerald-400 text-[#0f1117]' : CHIP_INACTIVE
            }`}
          >
            免费
          </button>
          <button
            type="button"
            onClick={() => {
              setPriceFilter(priceFilter === 'paid' ? 'all' : 'paid')
              setVisibleCount(INITIAL)
            }}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              priceFilter === 'paid' ? 'border-[#7b8cde] bg-[#7b8cde] text-white' : CHIP_INACTIVE
            }`}
          >
            付费
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilter}
              className="rounded-full border border-dashed border-[#3a3d55] px-2.5 py-1 text-xs text-[#5a6080] transition hover:border-[#7b8cde] hover:text-[#7b8cde]"
            >
              清除
            </button>
          )}

          <span className="hidden h-5 w-px bg-[#2a2d3e] sm:block" />

          {DAY_OPTIONS.map((d) => (
            <a
              key={d}
              href={`/?days=${d}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedDays === d ? CHIP_DAYS_ACTIVE : CHIP_INACTIVE
              }`}
            >
              {d}天
            </a>
          ))}
        </div>
      </div>

      {tagOptions.length > 0 && (
        <div className="border-x border-[#2a2d3e] bg-[#151826] px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#5a6080]">热门标签</span>
            {tagOptions.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  selectedTags.has(tag)
                    ? 'border-[#7b8cde] bg-[#7b8cde]/20 text-[#c9d0ff]'
                    : 'border-[#2a2d3e] bg-[#0f1117] text-[#8a91aa] hover:border-[#7b8cde]/60 hover:text-[#c9d0ff]'
                }`}
              >
                {tag}
                <span className="ml-1 text-[#5a6080]">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <div className="rounded-b-lg border-x border-b border-[#2a2d3e] bg-[#11141f] p-2 sm:p-4">
        {visible.length ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {visible.map((game) => (
                <DashboardCard key={game.id} game={game} />
              ))}
            </div>

            {hasMore ? (
              <div ref={loadMoreRef} className="mt-5 grid h-12 place-items-center text-xs text-[#5a6080]">
                <span className="rounded-full border border-[#2a2d3e] bg-[#1a1d2e] px-4 py-1.5">
                  继续向下加载 <span className="text-[#7b8cde]">{Math.min(STEP, remaining)}</span> 款
                  <span className="ml-1 text-[#4a5070]">/ 剩余 {remaining}</span>
                </span>
              </div>
            ) : filtered.length > INITIAL ? (
              <div className="mt-5 grid h-10 place-items-center text-xs text-[#4a5070]">
                已显示全部 {filtered.length} 款
              </div>
            ) : null}
          </>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
            暂无符合当前筛选的即将发售游戏
          </div>
        )}
      </div>
    </section>
  )
}
