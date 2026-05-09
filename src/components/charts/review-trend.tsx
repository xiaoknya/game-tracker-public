'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { ReviewMonthlyStat } from '@/lib/api'

const chartConfig = {
  new_reviews: {
    label: '评测数',
    color: 'rgb(123,140,222)',
  },
  positive_pct: {
    label: '好评率 %',
    color: 'rgb(251,191,36)',
  },
} satisfies ChartConfig

/** Normalize positive_rate to 0-100, regardless of whether API returns 0-1 or 0-100 */
function toPct(v: number | null): number | null {
  if (v == null) return null
  return Math.round(v > 1 ? v : v * 100)
}

export function ReviewTrend({ data }: { data: ReviewMonthlyStat[] }) {
  const items = data.slice(-9).map((d) => ({
    month: d.month?.slice(0, 7) ?? '',
    new_reviews: d.new_reviews ?? 0,
    positive_pct: toPct(d.positive_rate),
  }))

  if (items.length === 0) {
    return (
      <div className="grid h-28 place-items-center text-xs text-[#5a6080]">
        暂无评测数据
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-44 w-full">
      <ComposedChart data={items} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#5a6080', fontSize: 9 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="reviews"
          tick={{ fill: '#5a6080', fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          width={34}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
          }
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          tick={{ fill: '#5a6080', fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          width={30}
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          yAxisId="reviews"
          dataKey="new_reviews"
          fill="rgb(123,140,222)"
          fillOpacity={0.75}
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="pct"
          dataKey="positive_pct"
          stroke="rgb(251,191,36)"
          strokeWidth={2}
          dot={{ fill: 'rgb(251,191,36)', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
          type="monotone"
        />
      </ComposedChart>
    </ChartContainer>
  )
}
