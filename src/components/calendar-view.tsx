'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { type Game, steamCover } from '@/lib/api'
import { compactNumber, signedCompact, score, releaseDate } from '@/lib/format'
import { RatingBadge } from '@/components/rating-badge'
import { ReleaseDateChangeBadge } from '@/components/release-date-change-badge'
import { PriceBadge } from '@/components/price-badge'
import { useWatchlistIds } from '@/lib/watchlist'

// ─── Types ────────────────────────────────────────────────────────────────────

type RatingTone = 's' | 'a' | 'b' | 'c' | 'none'

interface CalendarCell {
  key: string
  dateStr: string
  monthKey: string
  day: number
  inMonth: boolean
  count: number
  savedCount: number
  rating: RatingTone
  signals: Array<'S' | 'A' | 'B'>
  isSelected: boolean
  isToday: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function toDateKey(y: number, m: number, d: number) {
  return `${toMonthKey(y, m)}-${String(d).padStart(2, '0')}`
}

function shiftMonth(mk: string, delta: number): string {
  const [y, m] = mk.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return toMonthKey(date.getFullYear(), date.getMonth() + 1)
}

function daysInMonth(mk: string): number {
  const [y, m] = mk.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function firstWeekday(mk: string): number {
  const [y, m] = mk.split('-').map(Number)
  return new Date(y, m - 1, 1).getDay()
}

function normalizeRating(r: string | null | undefined): RatingTone {
  switch ((r ?? '').toUpperCase()) {
    case 'S': return 's'
    case 'A': return 'a'
    case 'B': return 'b'
    case 'C': return 'c'
    default: return 'none'
  }
}

function ratingPriority(r: RatingTone): number {
  return { s: 4, a: 3, b: 2, c: 1, none: 0 }[r]
}

function compareFeatured(a: Game, b: Game): number {
  const rA = ratingPriority(normalizeRating(a.rating))
  const rB = ratingPriority(normalizeRating(b.rating))
  if (rB !== rA) return rB - rA
  const sA = a.total_score ?? 0
  const sB = b.total_score ?? 0
  if (sB !== sA) return sB - sA
  return (b.followers ?? 0) - (a.followers ?? 0)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="min-w-[112px] rounded-lg border border-[#2a2d3e] bg-white/[0.04] px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-widest text-[#5a70c0]">{label}</div>
      <div className="mt-0.5 text-2xl font-bold leading-tight text-[#e0e4f0]">{value}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-[#5a6080]">{sub}</div>}
    </div>
  )
}

function DayCell({ cell, onClick }: { cell: CalendarCell; onClick: () => void }) {
  const base = 'relative flex min-h-[64px] cursor-pointer flex-col rounded-lg border p-1.5 text-left transition-all sm:min-h-[72px] sm:p-2 xl:min-h-[68px]'

  let colorCls = 'border-transparent bg-transparent hover:bg-white/[0.04]'
  if (cell.isSelected) {
    if (cell.rating === 's') colorCls = 'border-rose-400/60 bg-rose-400/10 shadow-[0_0_8px_rgba(251,113,133,0.2)]'
    else if (cell.rating === 'a') colorCls = 'border-amber-400/60 bg-amber-400/10 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
    else if (cell.rating === 'b') colorCls = 'border-sky-400/60 bg-sky-400/10 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
    else colorCls = 'border-white/20 bg-white/[0.07] shadow-sm'
  } else if (cell.isToday) {
    colorCls = 'border-teal-400/40 bg-teal-400/10 hover:bg-teal-400/15'
  } else if (cell.count > 0) {
    colorCls = 'border-[#2a2d3e] bg-white/[0.03] hover:bg-white/[0.06]'
  }

  const mutedCls = !cell.inMonth ? 'opacity-40' : ''

  return (
    <button className={`${base} ${colorCls} ${mutedCls}`} onClick={onClick}>
      <div className="flex items-start justify-between gap-1">
        <span className={`text-[15px] font-semibold leading-none sm:text-base ${cell.isToday ? 'text-teal-300' : 'text-[#a0b0d0]'}`}>
          {cell.day}
        </span>
        {cell.isToday && (
          <span className="rounded-full bg-teal-400/25 px-1.5 py-0.5 text-[10px] font-bold leading-none text-teal-300">今</span>
        )}
      </div>
      {cell.count > 0 && (
        <div className="mt-auto flex flex-col gap-1">
          {cell.signals.slice(0, 2).map((s, i) => (
            <span
              key={i}
              className={`inline-block w-fit rounded-sm px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                s === 'S' ? 'bg-rose-400/20 text-rose-300' :
                s === 'A' ? 'bg-amber-400/20 text-amber-300' :
                'bg-sky-400/20 text-sky-300'
              }`}
            >
              {s}
            </span>
          ))}
          {cell.count > 0 && (
            <span className="text-[10px] leading-none text-[#5a6080] sm:text-[11px]">{cell.count}款</span>
          )}
          {cell.savedCount > 0 && (
            <span className="text-[10px] leading-none text-[#9aa8ff] sm:text-[11px]">已藏 {cell.savedCount}</span>
          )}
        </div>
      )}
    </button>
  )
}

function GameCard({ game, saved }: { game: Game; saved?: boolean }) {
  const tags = (game.tags || game.genre || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 3)
  const cover = game.cover_image || steamCover(game.steam_appid)

  return (
    <Link
      href={`/games/${game.id}`}
      className="flex gap-3 rounded-lg border border-[#2a2d3e] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
    >
      {cover && (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
          <Image src={cover} alt={game.name} fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <RatingBadge rating={game.rating} className="h-5 min-w-7 text-xs" />
          <span className="truncate text-sm font-semibold text-[#e0e4f0]">{game.name}</span>
          {saved && <span className="rounded bg-[#7b8cde]/20 px-1.5 py-0.5 text-[10px] text-[#b7c2ff]">已收藏</span>}
        </div>
        {game.short_description && (
          <p className="mt-1 line-clamp-2 text-xs text-[#7a8099]">{game.short_description}</p>
        )}
        {tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tags.map(t => (
              <span key={t} className="rounded-sm border border-[#2a2d3e] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-[#7a8099]">{t}</span>
            ))}
          </div>
        )}
        <div className="mt-1.5 flex gap-3 text-[11px] text-[#5a6080]">
          <span>{compactNumber(game.followers)} 关注</span>
          {game.followers_7d_delta !== null && game.followers_7d_delta !== undefined && (
            <span className={game.followers_7d_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {signedCompact(game.followers_7d_delta)} 7d
            </span>
          )}
          {game.total_score !== null && game.total_score !== undefined && (
            <span className="text-[#7b8cde]">评分 {score(game.total_score)}</span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <PriceBadge price={game.primary_price} compact mutedWhenUnknown isFreeFallback={Boolean(game.is_free)} />
          <ReleaseDateChangeBadge event={game.latest_release_date_event} compact />
        </div>
      </div>
    </Link>
  )
}

function FeaturedCard({ game, saved }: { game: Game; saved?: boolean }) {
  const cover = game.cover_image || steamCover(game.steam_appid)
  const daysLeft = game.days_to_release

  return (
    <Link
      href={`/games/${game.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-[#2a2d3e] bg-white/[0.03] transition hover:bg-white/[0.06]"
    >
      <div className="relative aspect-[16/9] w-full">
        {cover ? (
          <Image src={cover} alt={game.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="h-full w-full bg-[#1a1d2e]" />
        )}
      </div>
      <div className="p-2.5">
        <div className="flex items-start gap-2">
          <RatingBadge rating={game.rating} className="h-5 min-w-7 shrink-0 text-xs" />
          <span className="line-clamp-1 text-xs font-semibold text-[#e0e4f0]">{game.name}</span>
          {saved && <span className="ml-auto shrink-0 rounded bg-[#7b8cde]/20 px-1.5 py-0.5 text-[10px] text-[#b7c2ff]">已藏</span>}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#5a6080]">
          <span>{releaseDate(game.release_date, game.release_date_is_fuzzy)}</span>
          <span>{compactNumber(game.followers)} 关注</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <PriceBadge price={game.primary_price} compact mutedWhenUnknown isFreeFallback={Boolean(game.is_free)} />
          <ReleaseDateChangeBadge event={game.latest_release_date_event} compact />
        </div>
        {daysLeft !== null && daysLeft !== undefined && daysLeft >= 0 && (
          <div className="mt-1 text-[10px] text-[#7b8cde]">
            {daysLeft === 0 ? '今日发售' : `${daysLeft} 天后发售`}
          </div>
        )}
      </div>
    </Link>
  )
}

function FuzzyItem({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="flex items-center justify-between gap-3 rounded-md border border-[#2a2d3e] px-3 py-2 transition hover:bg-white/[0.04]"
    >
      <div className="min-w-0">
        <div className="truncate text-sm text-[#d9def0]">{game.name}</div>
        <div className="mt-0.5 text-xs text-[#5a6080]">{releaseDate(game.release_date, true)}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PriceBadge price={game.primary_price} compact mutedWhenUnknown isFreeFallback={Boolean(game.is_free)} />
        <span className="text-xs text-[#7a8099]">{compactNumber(game.followers)}</span>
        <RatingBadge rating={game.rating} className="h-5 min-w-7 text-xs" />
      </div>
    </Link>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CalendarView({
  upcomingGames,
  fuzzyGames,
}: {
  upcomingGames: Game[]
  fuzzyGames: Game[]
}) {
  const today = new Date()
  const todayStr = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const currentMonthKey = toMonthKey(today.getFullYear(), today.getMonth() + 1)

  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)
  const savedIds = useWatchlistIds()
  const savedSet = useMemo(() => new Set(savedIds), [savedIds])

  // Derived data
  const {
    exactGamesByDate,
    exactGamesByMonth,
    fuzzyGamesByMonth,
    availableMonthKeys,
  } = useMemo(() => {
    // Map all non-fuzzy upcoming games by date and month
    const exactGamesByDate = new Map<string, Game[]>()
    const exactGamesByMonth = new Map<string, Game[]>()

    for (const game of upcomingGames) {
      if (game.release_date_is_fuzzy || !game.release_date) continue
      const dateStr = game.release_date // already "YYYY-MM-DD"
      const monthKey = dateStr.slice(0, 7)

      if (!exactGamesByDate.has(dateStr)) exactGamesByDate.set(dateStr, [])
      exactGamesByDate.get(dateStr)!.push(game)

      if (!exactGamesByMonth.has(monthKey)) exactGamesByMonth.set(monthKey, [])
      exactGamesByMonth.get(monthKey)!.push(game)
    }

    // Map fuzzy games by month
    const fuzzyGamesByMonth = new Map<string, Game[]>()
    for (const game of fuzzyGames) {
      if (!game.release_date) continue
      // fuzzy dates may be "YYYY-MM" or "YYYY-MM-DD"
      const monthKey = game.release_date.slice(0, 7)
      if (!fuzzyGamesByMonth.has(monthKey)) fuzzyGamesByMonth.set(monthKey, [])
      fuzzyGamesByMonth.get(monthKey)!.push(game)
    }

    // Available months: from current month to furthest release + at least 3 ahead
    let maxMonthKey = shiftMonth(currentMonthKey, 3)
    for (const key of exactGamesByMonth.keys()) {
      if (key > maxMonthKey) maxMonthKey = key
    }
    for (const key of fuzzyGamesByMonth.keys()) {
      if (key > maxMonthKey) maxMonthKey = key
    }

    const availableMonthKeys: string[] = []
    let cursor = currentMonthKey
    while (cursor <= maxMonthKey) {
      availableMonthKeys.push(cursor)
      cursor = shiftMonth(cursor, 1)
    }

    return { exactGamesByDate, exactGamesByMonth, fuzzyGamesByMonth, availableMonthKeys }
  }, [upcomingGames, fuzzyGames, currentMonthKey])

  // Derived per-month data
  const selectedMonthGames = useMemo(
    () => exactGamesByMonth.get(selectedMonthKey) ?? [],
    [exactGamesByMonth, selectedMonthKey],
  )
  const selectedMonthFuzzyGames = useMemo(
    () => fuzzyGamesByMonth.get(selectedMonthKey) ?? [],
    [fuzzyGamesByMonth, selectedMonthKey],
  )

  // Effective selected date
  const effectiveSelectedDate = useMemo(() => {
    if (selectedDateStr !== null) return selectedDateStr
    // Auto-pick: nearest upcoming date with games, or today if has games, or day 1
    const [y, m] = selectedMonthKey.split('-').map(Number)
    const days = daysInMonth(selectedMonthKey)
    // Check today first
    if (todayStr.startsWith(selectedMonthKey) && exactGamesByDate.has(todayStr)) {
      return todayStr
    }
    // Find nearest upcoming date in month with games
    for (let d = 1; d <= days; d++) {
      const ds = toDateKey(y, m, d)
      if (ds >= todayStr && exactGamesByDate.has(ds)) return ds
    }
    return toDateKey(y, m, 1)
  }, [selectedMonthKey, selectedDateStr, exactGamesByDate, todayStr])

  const selectedDayGames = exactGamesByDate.get(effectiveSelectedDate) ?? []

  const featuredGames = useMemo(() => {
    return [...selectedMonthGames].sort(compareFeatured).slice(0, 6)
  }, [selectedMonthGames])

  // Calendar cells (35 or 42)
  const calendarCells = useMemo((): CalendarCell[] => {
    const [y, m] = selectedMonthKey.split('-').map(Number)
    const days = daysInMonth(selectedMonthKey)
    const startWd = firstWeekday(selectedMonthKey)
    const totalCells = startWd + days > 35 ? 42 : 35
    const cells: CalendarCell[] = []

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startWd + 1
      let cellYear = y, cellMonth = m, cellDay = dayOffset

      if (dayOffset < 1) {
        // Previous month
        const prevDate = new Date(y, m - 2, 0)
        cellYear = prevDate.getFullYear()
        cellMonth = prevDate.getMonth() + 1
        cellDay = prevDate.getDate() + dayOffset
      } else if (dayOffset > days) {
        // Next month
        const nextDate = new Date(y, m, dayOffset - days)
        cellYear = nextDate.getFullYear()
        cellMonth = nextDate.getMonth() + 1
        cellDay = nextDate.getDate()
      }

      const dateStr = toDateKey(cellYear, cellMonth, cellDay)
      const monthKey = toMonthKey(cellYear, cellMonth)
      const inMonth = monthKey === selectedMonthKey
      const gamesOnDay = exactGamesByDate.get(dateStr) ?? []

      // Determine dominant rating from calendar-eligible games on this day
      const calendarOnDay = gamesOnDay.filter(g => {
        const r = normalizeRating(g.rating)
        return r === 's' || r === 'a' || r === 'b'
      })
      let rating: RatingTone = 'none'
      let maxPriority = 0
      const signalSet = new Set<'S' | 'A' | 'B'>()
      for (const g of calendarOnDay) {
        const r = normalizeRating(g.rating)
        const p = ratingPriority(r)
        if (p > maxPriority) { maxPriority = p; rating = r }
        if (r === 's') signalSet.add('S')
        else if (r === 'a') signalSet.add('A')
        else if (r === 'b') signalSet.add('B')
      }
      const signalOrder: Array<'S' | 'A' | 'B'> = ['S', 'A', 'B']
      const signals = signalOrder.filter(s => signalSet.has(s))

      cells.push({
        key: dateStr,
        dateStr,
        monthKey,
        day: cellDay,
        inMonth,
        count: calendarOnDay.length,
        rating,
        signals,
        isSelected: dateStr === effectiveSelectedDate,
        isToday: dateStr === todayStr,
        savedCount: gamesOnDay.filter((game) => savedSet.has(game.id)).length,
      })
    }
    return cells
  }, [selectedMonthKey, effectiveSelectedDate, exactGamesByDate, savedSet, todayStr])

  // Stats
  const releaseDaysCount = useMemo(() => {
    const [y, m] = selectedMonthKey.split('-').map(Number)
    const days = daysInMonth(selectedMonthKey)
    let count = 0
    for (let d = 1; d <= days; d++) {
      const ds = toDateKey(y, m, d)
      if (exactGamesByDate.has(ds)) count++
    }
    return count
  }, [selectedMonthKey, exactGamesByDate])

  const highRatedCount = useMemo(() => {
    return selectedMonthGames.filter(g => {
      const r = normalizeRating(g.rating)
      return r === 's' || r === 'a'
    }).length
  }, [selectedMonthGames])

  const savedInMonth = useMemo(
    () => selectedMonthGames.filter((game) => savedSet.has(game.id)).length,
    [savedSet, selectedMonthGames],
  )

  const topGameName = useMemo(() => {
    const top = [...selectedMonthGames].sort(compareFeatured)[0]
    return top ? top.name : '暂无'
  }, [selectedMonthGames])

  // Navigation
  const minMonthKey = availableMonthKeys[0] ?? currentMonthKey
  const maxMonthKey = availableMonthKeys[availableMonthKeys.length - 1] ?? currentMonthKey
  const canGoPrev = selectedMonthKey > minMonthKey
  const canGoNext = selectedMonthKey < maxMonthKey

  function stepMonth(delta: number) {
    const next = shiftMonth(selectedMonthKey, delta)
    setSelectedMonthKey(next)
    setSelectedDateStr(null) // reset date, auto-pick will run
  }

  function selectCell(cell: CalendarCell) {
    setSelectedDateStr(cell.dateStr)
    if (cell.monthKey !== selectedMonthKey) {
      setSelectedMonthKey(cell.monthKey)
    }
  }

  // Labels
  const [selY, selM] = selectedMonthKey.split('-').map(Number)
  const selectedMonthLabel = new Date(selY, selM - 1, 1).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  const selectedDateObj = effectiveSelectedDate
    ? new Date(`${effectiveSelectedDate}T00:00:00`)
    : null
  const selectedDateBadge = selectedDateObj
    ? selectedDateObj.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
    : ''
  const selectedDateTitle = selectedDateObj
    ? `${selectedDateObj.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 发售游戏`
    : '选择日期'
  const selectedDateLabel = selectedDateObj
    ? selectedDateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    : ''

  const navBtnCls = (disabled: boolean) =>
    `grid size-9 place-items-center rounded-md border text-xl transition sm:size-10 ${
      disabled
        ? 'cursor-not-allowed border-[#1e2133] text-[#3a3f5c]'
        : 'border-[#2a2d3e] text-[#a0b0d0] hover:border-[#7b8cde] hover:text-[#e0e4f0]'
    }`

  return (
    <div className="space-y-4">
      {/* Hero bar */}
      <div className="rounded-xl border border-[#2a2d3e] bg-gradient-to-r from-[#141828] to-[#1a1d2e] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#7b8cde]">Release Radar</div>
            <h1 className="mt-1 text-2xl font-bold text-[#e0e4f0]">发售日历</h1>
            <p className="mt-1 text-sm text-[#7a8099]">
              覆盖 {availableMonthKeys.length} 个自然月 · 展示 S/A/B 级游戏
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:gap-3">
            <StatCard label="本月发售" value={selectedMonthGames.length} sub={`${releaseDaysCount} 个发售日`} />
            <StatCard label="A级以上" value={highRatedCount} sub={topGameName} />
            <StatCard label="当天上新" value={selectedDayGames.length} sub={selectedDateLabel} />
            <StatCard label="已收藏" value={savedInMonth} sub="当前浏览器" />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 xl:grid-cols-[420px_1fr] 2xl:grid-cols-[480px_1fr]">
        {/* Calendar panel */}
        <div className="space-y-4 rounded-xl border border-[#2a2d3e] bg-gradient-to-b from-[#1c2240] to-[#141828] p-4 sm:p-5 xl:sticky xl:top-[76px] xl:self-start">
          {/* Month nav header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#5a70c0]">月历导航</div>
              <div className="mt-1 text-3xl font-bold leading-tight text-[#e0e4f0] sm:text-[34px]">{selectedMonthLabel}</div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[#a0b0e0]">
                  {highRatedCount} 款 A+ 以上
                </span>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[#a0b0e0]">
                  {selectedMonthGames.length} 款精确发售
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                disabled={!canGoPrev}
                onClick={() => stepMonth(-1)}
                className={navBtnCls(!canGoPrev)}
                aria-label="上一个月"
              >
                ‹
              </button>
              <button
                disabled={!canGoNext}
                onClick={() => stepMonth(1)}
                className={navBtnCls(!canGoNext)}
                aria-label="下一个月"
              >
                ›
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-rose-300">S 级</span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-amber-300">A 级</span>
            <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-sky-300">B 级</span>
            <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-teal-300">今日</span>
            <span className="rounded-full border border-[#7b8cde]/30 bg-[#7b8cde]/10 px-2.5 py-1 text-[#b7c2ff]">已收藏</span>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-[#5a6080] sm:text-sm">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map(cell => (
              <DayCell key={cell.key} cell={cell} onClick={() => selectCell(cell)} />
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="space-y-4">
          {/* Selected day panel */}
          <div className="rounded-xl border border-[#2a2d3e] bg-[#11141f] p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#5a6080]">{selectedDateBadge}</div>
                <h2 className="mt-1 text-lg font-semibold text-[#e0e4f0]">{selectedDateTitle}</h2>
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[#7a8099]">
                {selectedDayGames.length} 款
              </span>
            </div>
            {selectedDayGames.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedDayGames.map(g => <GameCard key={g.id} game={g} saved={savedSet.has(g.id)} />)}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[#5a6080]">这一天暂无精确发售</div>
            )}
          </div>

          {/* Featured games */}
          <div className="rounded-xl border border-[#2a2d3e] bg-[#11141f] p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#5a6080]">本月精选</div>
                <h2 className="mt-1 text-lg font-semibold text-[#e0e4f0]">{selectedMonthLabel} 值得优先看的游戏</h2>
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[#7a8099]">
                {featuredGames.length} 款
              </span>
            </div>
            {featuredGames.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featuredGames.map(g => <FeaturedCard key={g.id} game={g} saved={savedSet.has(g.id)} />)}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-[#5a6080]">本月暂无精确发售游戏</div>
            )}
          </div>
        </div>
      </div>

      {/* Fuzzy games */}
      {selectedMonthFuzzyGames.length > 0 && (
        <div className="rounded-xl border border-[#2a2d3e] bg-[#11141f] p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5a6080]">档期待确认</div>
              <h2 className="mt-1 text-lg font-semibold text-[#e0e4f0]">{selectedMonthLabel} 的模糊发售项</h2>
            </div>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[#7a8099]">
              {selectedMonthFuzzyGames.length} 款
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedMonthFuzzyGames.map(g => <FuzzyItem key={g.id} game={g} />)}
          </div>
        </div>
      )}
    </div>
  )
}
