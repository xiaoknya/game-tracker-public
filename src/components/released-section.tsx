'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ReleasedCard } from '@/components/released-card'
import type { ReleasedGame } from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────
const RATINGS = ['S', 'A', 'B', 'C'] as const
type Rating = (typeof RATINGS)[number]

const DAY_OPTIONS = [30, 60, 90, 180]
const INITIAL = 12
const STEP = 12
const SORT_OPTIONS = [
  { key: 'combined', label: '综合排序' },
  { key: 'positive', label: '好评率' },
  { key: 'date', label: '发售时间' },
  { key: 'reviews', label: '评测数' },
  { key: 'playtime', label: '中位时长' },
] as const
type SortKey = (typeof SORT_OPTIONS)[number]['key']
type OpinionFilter = 'all' | 'high' | 'mixed' | 'low'

const RATING_ACTIVE: Record<Rating, string> = {
  S: 'border-rose-400 bg-rose-400 text-[#0f1117]',
  A: 'border-amber-300 bg-amber-300 text-[#0f1117]',
  B: 'border-sky-400 bg-sky-400 text-[#0f1117]',
  C: 'border-[#a0a8c8] bg-[#a0a8c8] text-[#0f1117]',
}
const CHIP_INACTIVE = 'border-[#2a2d3e] bg-transparent text-[#a0a8c0] hover:bg-[#202437]'
const CHIP_DAYS_ACTIVE = 'border-[#7b8cde] bg-[#7b8cde] text-white'

function positiveRate(game: ReleasedGame) {
  if (!game.steam_review_total || !game.steam_review_positive) return -1
  return game.steam_review_positive / game.steam_review_total
}

function reviewConfidenceScore(game: ReleasedGame) {
  const total = game.steam_review_total ?? 0
  const positive = game.steam_review_positive ?? 0
  if (total <= 0 || positive <= 0) return -1

  const z = 1.96
  const phat = positive / total
  const z2 = z * z
  return (
    (phat + z2 / (2 * total) - z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total)) /
    (1 + z2 / total)
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ReleasedSection({
  allGames,
  selectedDays,
}: {
  allGames: ReleasedGame[]
  selectedDays: number
}) {
  const [selected, setSelected] = useState<Set<Rating>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('combined')
  const [opinion, setOpinion] = useState<OpinionFilter>('all')
  const [visibleCount, setVisibleCount] = useState(INITIAL)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const toggle = (r: Rating) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(r)) next.delete(r)
      else next.add(r)
      return next
    })
    setVisibleCount(INITIAL)
  }

  const clearFilter = () => {
    setSelected(new Set())
    setOpinion('all')
    setVisibleCount(INITIAL)
  }

  const filtered = useMemo(() => {
    const games = allGames.filter((g) => {
      if (selected.size > 0 && (!g.rating || !selected.has(g.rating as Rating))) return false
      const positiveRate =
        g.steam_review_total && g.steam_review_positive
          ? Math.round((g.steam_review_positive / g.steam_review_total) * 100)
          : null
      if (opinion === 'high' && (positiveRate === null || positiveRate < 80)) return false
      if (opinion === 'mixed' && (positiveRate === null || positiveRate < 60 || positiveRate >= 80)) return false
      if (opinion === 'low' && (positiveRate === null || positiveRate >= 60)) return false
      return true
    })

    return games.sort((a, b) => {
      if (sortBy === 'combined') {
        const scoreDiff = reviewConfidenceScore(b) - reviewConfidenceScore(a)
        if (scoreDiff !== 0) return scoreDiff
        return (b.steam_review_total ?? -1) - (a.steam_review_total ?? -1)
      }
      if (sortBy === 'positive') {
        const aRate = positiveRate(a)
        const bRate = positiveRate(b)
        return bRate - aRate
      }
      if (sortBy === 'reviews') return (b.steam_review_total ?? -1) - (a.steam_review_total ?? -1)
      if (sortBy === 'playtime') return (b.steam_median_playtime ?? -1) - (a.steam_median_playtime ?? -1)
      return (b.release_date ?? '').localeCompare(a.release_date ?? '')
    })
  }, [allGames, opinion, selected, sortBy])

  const visible = filtered.slice(0, visibleCount)
  const remaining = filtered.length - visibleCount
  const hasMore = remaining > 0
  const hasFilters = selected.size > 0 || opinion !== 'all'
  const opinionStats = useMemo(() => {
    let high = 0
    let mixed = 0
    let low = 0
    allGames.forEach((game) => {
      if (!game.steam_review_total || !game.steam_review_positive) return
      const rate = game.steam_review_positive / game.steam_review_total
      if (rate >= 0.8) high += 1
      else if (rate >= 0.6) mixed += 1
      else low += 1
    })
    return { high, mixed, low }
  }, [allGames])

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
          <span className="text-sm font-semibold text-[#e0e4f0]">近期已发售</span>
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

          {[
            ['high', `高口碑 ${opinionStats.high}`],
            ['mixed', `中间档 ${opinionStats.mixed}`],
            ['low', `低口碑 ${opinionStats.low}`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setOpinion(opinion === key ? 'all' : (key as OpinionFilter))
                setVisibleCount(INITIAL)
              }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                opinion === key ? 'border-[#7b8cde] bg-[#7b8cde]/20 text-[#c9d0ff]' : CHIP_INACTIVE
              }`}
            >
              {label}
            </button>
          ))}

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
              href={`/released?days=${d}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedDays === d ? CHIP_DAYS_ACTIVE : CHIP_INACTIVE
              }`}
            >
              {d === 180 ? '半年' : `${d}天`}
            </a>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="rounded-b-lg border-x border-b border-[#2a2d3e] bg-[#11141f] p-2 sm:p-4">
        {visible.length ? (
          <>
            <div className="grid gap-2 sm:gap-3 md:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {visible.map((game) => (
                <ReleasedCard key={game.id} game={game} />
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
            暂无符合当前筛选的已发售游戏
          </div>
        )}
      </div>
    </section>
  )
}
