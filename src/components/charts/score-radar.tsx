'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'

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
    { axis: 'Bilibili',  value: Number(latestScore?.score_bilibili  ?? 0) },
    { axis: 'MOD',       value: Number(latestScore?.score_mod       ?? 0) },
    {
      axis: 'Reddit',
      value: Number(latestScore?.score_reddit ?? latestScore?.score_baidu ?? 0),
    },
    { axis: '增长', value: Number(latestScore?.score_growth ?? 0) },
  ]

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-[260px] w-[260px]"
    >
      <RadarChart data={data}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent formatter={(v) => [Number(v).toFixed(2), '分']} />}
        />
        <PolarGrid stroke="#2a2d3e" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: '#7a8099', fontSize: 11 }}
        />
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
