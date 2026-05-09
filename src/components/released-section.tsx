'use client'

import { useMemo, useState } from 'react'

import { ReleasedCard } from '@/components/released-card'
import type { ReleasedGame } from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────
const RATINGS = ['S', 'A', 'B', 'C'] as const
type Rating = (typeof RATINGS)[number]

const DAY_OPTIONS = [30, 60, 90, 180]

const RATING_ACTIVE: Record<Rating, string> = {
  S: 'border-rose-400 bg-rose-400 text-[#0f1117]',
  A: 'border-amber-300 bg-amber-300 text-[#0f1117]',
  B: 'border-sky-400 bg-sky-400 text-[#0f1117]',
  C: 'border-[#a0a8c8] bg-[#a0a8c8] text-[#0f1117]',
}

const CHIP_INACTIVE =
  'border-[#2a2d3e] bg-transparent text-[#a0a8c0] hover:bg-[#202437]'
const CHIP_DAYS_ACTIVE = 'border-[#7b8cde] bg-[#7b8cde] text-white'

// ─── Component ────────────────────────────────────────────────────────────────
export function ReleasedSection({
  allGames,
  selectedDays,
}: {
  allGames: ReleasedGame[]
  selectedDays: number
}) {
  const [selected, setSelected] = useState<Set<Rating>>(new Set())

  const toggle = (r: Rating) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(r) ? next.delete(r) : next.add(r)
      return next
    })

  const filtered = useMemo(
    () =>
      selected.size === 0
        ? allGames
        : allGames.filter((g) => g.rating && selected.has(g.rating as Rating)),
    [allGames, selected],
  )

  return (
    <section className="mt-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 rounded-t-lg border border-[#2a2d3e] bg-[#1a1d2e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#e0e4f0]">近期已发售</span>
          <span className="rounded-full bg-[#0f1117] px-2 py-0.5 text-xs text-[#7b8cde]">
            {filtered.length}
          </span>
          {selected.size > 0 && (
            <span className="text-xs text-[#5a6080]">/ 共 {allGames.length}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ── Rating multi-select ── */}
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

          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-full border border-dashed border-[#3a3d55] px-2.5 py-1 text-xs text-[#5a6080] transition hover:border-[#7b8cde] hover:text-[#7b8cde]"
            >
              清除
            </button>
          )}

          <span className="hidden h-5 w-px bg-[#2a2d3e] sm:block" />

          {/* ── Days (href → server refetch) ── */}
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
      <div className="rounded-b-lg border-x border-b border-[#2a2d3e] bg-[#11141f] p-4">
        {filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((game) => (
              <ReleasedCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
            暂无{[...selected].join('/')} 级已发售游戏
          </div>
        )}
      </div>
    </section>
  )
}
