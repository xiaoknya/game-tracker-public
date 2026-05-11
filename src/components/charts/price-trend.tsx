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
import type { GamePriceSnapshot } from '@/lib/api'
import { currencyAmountLabel, steamPriceAmount } from '@/lib/format'

const chartConfig = {
  price: {
    label: '价格',
    color: 'rgb(251,191,36)',
  },
} satisfies ChartConfig

export function PriceTrend({ snapshots }: { snapshots: GamePriceSnapshot[] }) {
  const data = snapshots
    .filter((snapshot) => snapshot.is_available && snapshot.final_price != null)
    .map((snapshot) => {
      const currency = snapshot.currency || 'CNY'
      return {
        date: snapshot.snapshot_date?.slice(0, 10) ?? '',
        price: steamPriceAmount(snapshot.final_price, currency) ?? 0,
        currency,
      }
    })

  if (data.length === 0) {
    return (
      <div className="grid h-36 place-items-center text-xs text-[#5a6080]">
        暂无价格历史
      </div>
    )
  }

  const displayCurrency = data[data.length - 1]?.currency || 'CNY'

  return (
    <ChartContainer config={chartConfig} className="h-36 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(251,191,36)" stopOpacity={0.24} />
            <stop offset="95%" stopColor="rgb(251,191,36)" stopOpacity={0} />
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
          tickFormatter={(v: number) => currencyAmountLabel(v, displayCurrency, '')}
          width={52}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <>
                  <span className="text-muted-foreground">价格</span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {currencyAmountLabel(Number(value), item.payload?.currency || displayCurrency)}
                  </span>
                </>
              )}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="rgb(251,191,36)"
          strokeWidth={2}
          fill="url(#priceFill)"
          dot={data.length === 1 ? { r: 3, fill: 'rgb(251,191,36)' } : false}
          activeDot={{ r: 4, fill: 'rgb(251,191,36)' }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
