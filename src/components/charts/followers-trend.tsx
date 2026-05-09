'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { Snapshot } from '@/lib/api'

const chartConfig = {
  followers: {
    label: 'Followers',
    color: 'rgb(52,211,153)',
  },
} satisfies ChartConfig

function fmtK(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return String(v)
}

export function FollowersTrend({ snapshots }: { snapshots: Snapshot[] }) {
  const data = snapshots
    .filter((s) => s.steamdb_followers != null)
    .map((s) => ({
      date: s.snapshot_date?.slice(0, 10) ?? '',
      followers: s.steamdb_followers ?? 0,
    }))

  if (data.length === 0) {
    return (
      <div className="grid h-36 place-items-center text-xs text-[#5a6080]">
        暂无趋势数据
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-36 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="followersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(52,211,153)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="rgb(52,211,153)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#5a6080', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.slice(5)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#5a6080', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmtK}
          width={38}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="followers"
          stroke="rgb(52,211,153)"
          strokeWidth={2}
          fill="url(#followersFill)"
          dot={false}
          activeDot={{ r: 4, fill: 'rgb(52,211,153)' }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
