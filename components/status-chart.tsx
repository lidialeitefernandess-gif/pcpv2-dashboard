"use client"

import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const config = {
  qtd: { label: "OPs", color: "var(--chart-1)" },
} satisfies ChartConfig

export function StatusChart({ data }: { data: { status: string; qtd: number }[] }) {
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28 }}>
        <XAxis type="number" dataKey="qtd" hide />
        <YAxis
          type="category"
          dataKey="status"
          tickLine={false}
          axisLine={false}
          width={150}
          fontSize={11}
          tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 21) + "…" : v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="qtd" fill="var(--color-qtd)" radius={4} barSize={20}>
          <LabelList dataKey="qtd" position="right" className="fill-foreground" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
