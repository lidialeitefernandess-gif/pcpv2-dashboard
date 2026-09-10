"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Boxes,
  CalendarClock,
  CheckCircle2,
  Factory,
  Gauge,
  Layers,
  PauseCircle,
  PackageSearch,
  Timer,
} from "lucide-react"

import { ConsumoZpp009 } from "@/components/consumo-zpp009"
import type { ConsumoZpp009Item } from "@/lib/pcp-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KpiCard } from "@/components/kpi-card"
import { GaugeCard } from "@/components/gauge-card"
import { ProducaoChart } from "@/components/producao-chart"
import { StatusChart } from "@/components/status-chart"
import { ModeloChart } from "@/components/modelo-chart"
import { MotivoChart } from "@/components/motivo-chart"
import { OpsTable } from "@/components/ops-table"
import {
  computeKpis,
  statusBreakdown,
  modeloBreakdown,
  motivoBreakdown,
  producaoDiaria,
  shortModelo,
  type OP,
} from "@/lib/pcp-kpis"

const nf = new Intl.NumberFormat("pt-BR")

function StatChip({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof Activity
  tone: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/70 bg-card px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted" style={{ color: tone }}>
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col">
        <span className="font-mono text-lg font-semibold leading-none tabular-nums">{nf.format(value)}</span>
        <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

export function Dashboard({
  ops,
  modelos,
  atualizadoEm,
  consumoZpp009,
}: {
  ops: OP[]
  modelos: string[]
  atualizadoEm: string
  consumoZpp009: ConsumoZpp009Item[]
}) {
  const [modelo, setModelo] = useState<string>("Todos")

  const filtered = useMemo(() => (modelo === "Todos" ? ops : ops.filter((o) => o.modelo === modelo)), [ops, modelo])

  const kpis = useMemo(() => computeKpis(filtered), [filtered])
  const status = useMemo(() => statusBreakdown(filtered), [filtered])
  const porModelo = useMemo(() => modeloBreakdown(filtered), [filtered])
  const motivos = useMemo(() => motivoBreakdown(filtered), [filtered])
  const diaria = useMemo(() => producaoDiaria(filtered), [filtered])

  const atualizado = new Date(atualizadoEm).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 border-b border-border/70 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
            <Factory className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Produção <span className="text-muted-foreground">|</span> PCP
            </h1>
            <p className="text-sm text-muted-foreground">Planejamento e Controle da Produção — Chassis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Modelo</span>
            <Select value={modelo} onValueChange={setModelo}>
              <SelectTrigger className="w-[260px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os modelos</SelectItem>
                {modelos.map((m) => (
                  <SelectItem key={m} value={m}>
                    {shortModelo(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Headline KPIs */}
      <section aria-label="Indicadores principais" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Ordens Planejadas"
          value={nf.format(kpis.ordensPlanejadas)}
          unit="OPs"
          icon={Layers}
          accent
        />
        <KpiCard
          label="Produção Realizada"
          value={nf.format(kpis.producaoRealizada)}
          unit="OPs"
          hint={`${nf.format(kpis.qtdProduzida)} un. produzidas`}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          label="Aderência ao Plano"
          value={`${Math.round(kpis.aderenciaPlano * 100)}`}
          unit="%"
          icon={Gauge}
          tone={kpis.aderenciaPlano >= 0.85 ? "success" : kpis.aderenciaPlano >= 0.6 ? "warning" : "danger"}
        />
        <KpiCard
          label="Backlog"
          value={nf.format(kpis.backlog)}
          unit="un."
          hint="Planejado − produzido"
          icon={Boxes}
          tone={kpis.backlog > 0 ? "warning" : "success"}
        />
        <KpiCard
          label="Fill Rate"
          value={`${Math.round(kpis.fillRate * 100)}`}
          unit="%"
          hint="Fornecido vs. planejado"
          icon={PackageSearch}
          tone={kpis.fillRate >= 0.9 ? "success" : "warning"}
        />
        <KpiCard
          label="Cumprimento de Prazo"
          value={`${Math.round(kpis.cumprimentoPrazo * 100)}`}
          unit="%"
          icon={CalendarClock}
          tone={kpis.cumprimentoPrazo >= 0.9 ? "success" : "warning"}
        />
      </section>

      {/* Status strip */}
      <section
        aria-label="Status das ordens"
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <StatChip label="OPs Liberadas" value={kpis.opsLiberadas} icon={Activity} tone="var(--success)" />
        <StatChip label="Em Produção" value={kpis.opsEmProducao} icon={Factory} tone="var(--chart-3)" />
        <StatChip label="Aguardando Material" value={kpis.opsAguardandoMaterial} icon={Timer} tone="var(--warning)" />
        <StatChip label="OPs Paradas" value={kpis.opsParadas} icon={PauseCircle} tone="var(--destructive)" />
        <StatChip label="OPs Atrasadas" value={kpis.opsAtrasadas} icon={AlertTriangle} tone="var(--destructive)" />
      </section>

      {/* Charts */}
      <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="rounded-md border-border/70 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produção diária — planejado vs. produzido</CardTitle>
          </CardHeader>
          <CardContent>
            <ProducaoChart data={diaria} />
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição por status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart data={status} />
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/70 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Planejado vs. produzido por modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <ModeloChart data={porModelo} />
          </CardContent>
        </Card>

      </section>

      {/* Motivos + Tabela */}
      <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="rounded-md border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Motivos de atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <MotivoChart data={motivos} />
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/70 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ordens de produção</CardTitle>
          </CardHeader>
          <CardContent>
            <OpsTable ops={filtered} />
          </CardContent>
        </Card>
      </section>
<ConsumoZpp009 dados={consumoZpp009} />
      <footer className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
        <span>Fonte: Modelo_KPI_Producao_PCP</span>
        <span>Atualizado em {atualizado}</span>
      </footer>
    </div>
  )
}
