"use client"

import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const config = {
  qtd: { label: "OPs", color: "var(--chart-4)" },
} satisfies ChartConfig

export function MotivoChart({ data }: { data: { motivo: string; qtd: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Nenhum motivo de atraso registrado no período.
      </div>
    )
  }
  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28 }}>
        <XAxis type="number" dataKey="qtd" hide />
        <YAxis
          type="category"
          dataKey="motivo"
          tickLine={false}
          axisLine={false}
          width={180}
          fontSize={11}
          tickFormatter={(v: string) => (v.length > 26 ? v.slice(0, 25) + "…" : v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="qtd" fill="var(--color-qtd)" radius={4} barSize={18}>
          <LabelList dataKey="qtd" position="right" className="fill-foreground" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
