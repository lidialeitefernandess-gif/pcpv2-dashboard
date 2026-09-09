import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

type Tone = "default" | "success" | "warning" | "danger"

const toneMap: Record<Tone, string> = {
  default: "text-foreground",
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-destructive",
}

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = "default",
  accent = false,
}: {
  label: string
  value: string
  unit?: string
  hint?: string
  icon?: LucideIcon
  tone?: Tone
  accent?: boolean
}) {
  return (
    <Card
      className={cn(
        "relative gap-0 overflow-hidden rounded-md border-border/70 bg-card p-4",
        accent && "border-primary/40",
      )}
    >
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden />}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.7rem] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("font-mono text-3xl font-semibold tabular-nums tracking-tight", toneMap[tone])}>
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
