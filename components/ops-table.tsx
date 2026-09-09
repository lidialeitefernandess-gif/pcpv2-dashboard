"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { OP } from "@/lib/pcp-kpis"
import { shortModelo } from "@/lib/pcp-kpis"

function statusVariant(status: string): { className: string } {
  const s = status.toLowerCase()
  if (s.includes("produção")) return { className: "bg-[var(--chart-3)]/15 text-[var(--chart-3)] border-[var(--chart-3)]/30" }
  if (s.includes("parada")) return { className: "bg-destructive/15 text-destructive border-destructive/30" }
  if (s.includes("aguardando")) return { className: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30" }
  return { className: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30" }
}

const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "—")

export function OpsTable({ ops }: { ops: OP[] }) {
  const [q, setQ] = useState("")
  const filtered = ops.filter((o) => {
    if (!q) return true
    const t = q.toLowerCase()
    return o.op.toLowerCase().includes(t) || o.material.toLowerCase().includes(t) || o.modelo.toLowerCase().includes(t)
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Buscar por OP, material ou modelo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs bg-background"
        />
        <span className="text-xs text-muted-foreground">
          {filtered.length} de {ops.length} ordens
        </span>
      </div>
      <div className="max-h-[460px] overflow-auto rounded-md border border-border/70">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border/70 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider">OP</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Modelo</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">Plan.</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">Forn.</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">Prod.</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Data plan.</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">Atraso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.op} className="border-border/50">
                <TableCell className="font-mono text-xs tabular-nums">{o.op}</TableCell>
                <TableCell className="text-xs">{shortModelo(o.modelo)}</TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">{o.planejada}</TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">{o.fornecida}</TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">{o.produzida}</TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                  {fmtDate(o.dataPlanejada)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusVariant(o.status).className}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">
                  {o.diasAtraso > 0 ? (
                    <span className="text-destructive">{o.diasAtraso}d</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                  Nenhuma ordem encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
