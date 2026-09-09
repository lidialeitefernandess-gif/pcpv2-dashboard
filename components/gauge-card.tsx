"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function toneColor(pct: number) {
  if (pct >= 0.85) return "var(--success)"
  if (pct >= 0.6) return "var(--warning)"
  return "var(--destructive)"
}

export function GaugeCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number // 0..1
  hint?: string
}) {
  const pct = Math.max(0, Math.min(1, value))
  const color = toneColor(pct)
  const r = 42
  const c = 2 * Math.PI * r
  const dash = c * pct

  return (
    <Card className="flex flex-col items-center gap-3 rounded-md border-border/70 bg-card p-4">
      <span className="self-start text-[0.7rem] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="relative grid place-items-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn("font-mono text-2xl font-semibold tabular-nums")} style={{ color }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      {hint && <p className="text-center text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
