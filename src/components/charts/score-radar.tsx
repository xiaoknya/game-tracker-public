'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import type { Score } from '@/lib/api'

const chartConfig = {
  value: {
    label: '评级',
    color: 'rgb(123,140,222)',
  },
} satisfies ChartConfig

// Each dimension's weighted max (raw S=3 × weight × 10/3)
const DIMS = [
  { axis: 'Followers', field: 'score_followers' as const, weightedMax: 4.5 },
  { axis: 'Bilibili',  field: 'score_bilibili'  as const, weightedMax: 1.5 },
  { axis: 'MOD',       field: 'score_mod'       as const, weightedMax: 0.5 },
  { axis: 'Reddit',    field: 'score_reddit'    as const, weightedMax: 1.0 },
  { axis: '增长',      field: 'score_growth'    as const, weightedMax: 2.5 },
] as const

// Normalize weighted score → 0-3 equivalent (S=3, A=2, B=1)
function toGrade(weighted: number | null | undefined, max: number): number {
  if (!weighted) return 0
  return Math.round((weighted / max) * 3 * 100) / 100
}

// Custom tooltip that shows both the normalized grade and the raw weighted score
function RadarTooltipContent({ active, payload }: { active?: boolean; payload?: { payload: Record<string, number> }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const gradeLabel = d.value >= 2.8 ? 'S' : d.value >= 1.8 ? 'A' : d.value >= 0.8 ? 'B' : 'C'
  return (
    <div className="rounded-lg border border-[#2a2d3e] bg-[#0f1117] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[#e0e4f0]">{d.axis}</p>
      <p className="mt-1 text-[#7b8cde]">
        评级 <span className="font-bold">{gradeLabel}</span>
        <span className="ml-2 text-[#5a6080]">（{d.value.toFixed(2)} / 3）</span>
      </p>
      <p className="text-[#5a6080]">加权得分 {d.raw?.toFixed(2)}</p>
    </div>
  )
}

export function ScoreRadar({ latestScore }: { latestScore: Score | undefined }) {
  const data = DIMS.map((d) => {
    const raw = latestScore?.[d.field] ?? 0
    return {
      axis: d.axis,
      value: toGrade(raw, d.weightedMax),
      raw: Number(raw),
    }
  })

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-[260px] w-[260px]"
    >
      <RadarChart data={data} margin={{ top: 12, right: 28, bottom: 12, left: 28 }}>
        <ChartTooltip
          cursor={false}
          content={<RadarTooltipContent />}
        />
        <PolarGrid stroke="#2a2d3e" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: '#7a8099', fontSize: 11 }}
        />
        {/* domain [0,3]: S=3 A=2 B=1, all axes same scale */}
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.25}
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={{ r: 4, fillOpacity: 1 }}
        />
      </RadarChart>
    </ChartContainer>
  )
}
