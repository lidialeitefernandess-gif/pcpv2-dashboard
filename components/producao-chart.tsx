"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const config = {
  planejada: { label: "Planejado", color: "var(--chart-3)" },
  produzida: { label: "Produzido", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ProducaoChart({ data }: { data: { data: string; planejada: number; produzida: number }[] }) {
  const fmt = (d: string) => {
    const [, m, day] = d.split("-")
    return `${day}/${m}`
  }
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillProd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-produzida)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--color-produzida)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillPlan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-planejada)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-planejada)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="data" tickFormatter={fmt} tickLine={false} axisLine={false} tickMargin={8} fontSize={11} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={30} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => fmt(String(v))} />} />
        <Area
          dataKey="planejada"
          type="monotone"
          stroke="var(--color-planejada)"
          fill="url(#fillPlan)"
          strokeWidth={2}
        />
        <Area
          dataKey="produzida"
          type="monotone"
          stroke="var(--color-produzida)"
          fill="url(#fillProd)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
