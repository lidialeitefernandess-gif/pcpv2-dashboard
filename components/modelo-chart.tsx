"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { shortModelo } from "@/lib/pcp-kpis"

const config = {
  planejada: { label: "Planejado", color: "var(--chart-3)" },
  produzida: { label: "Produzido", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ModeloChart({ data }: { data: { modelo: string; planejada: number; produzida: number }[] }) {
  const chartData = data.map((d) => ({ ...d, nome: shortModelo(d.modelo) }))
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="nome" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} interval={0} />
        <YAxis tickLine={false} axisLine={false} width={34} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="planejada" fill="var(--color-planejada)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="produzida" fill="var(--color-produzida)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
