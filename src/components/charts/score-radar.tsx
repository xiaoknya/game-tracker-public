'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { Score } from '@/lib/api'

const chartConfig = {
  value: {
    label: '分数',
    color: 'rgb(123,140,222)',
  },
} satisfies ChartConfig

export function ScoreRadar({ latestScore }: { latestScore: Score | undefined }) {
  const data = [
    { axis: 'Followers', value: Number(latestScore?.score_followers ?? 0) },
    { axis: 'Bilibili', value: Number(latestScore?.score_bilibili ?? 0) },
    { axis: 'MOD', value: Number(latestScore?.score_mod ?? 0) },
    {
      axis: 'Reddit',
      value: Number(latestScore?.score_reddit ?? latestScore?.score_baidu ?? 0),
    },
    { axis: '增长', value: Number(latestScore?.score_growth ?? 0) },
  ]

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto w-full max-w-[260px] aspect-square"
    >
      <RadarChart data={data} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
        <PolarGrid stroke="#2a2d3e" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: '#7a8099', fontSize: 10 }}
        />
        <ChartTooltip content={<ChartTooltipContent nameKey="axis" />} />
        <Radar
          dataKey="value"
          stroke="rgb(123,140,222)"
          fill="rgba(123,140,222,0.18)"
          strokeWidth={1.5}
          dot={{ fill: 'rgb(123,140,222)', r: 3, strokeWidth: 0 }}
        />
      </RadarChart>
    </ChartContainer>
  )
}
