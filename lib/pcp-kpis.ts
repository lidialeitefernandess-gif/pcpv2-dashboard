export type OP = {
  op: string
  material: string
  modelo: string
  planejada: number
  fornecida: number
  produzida: number
  dataPlanejada: string | null
  dataConclusao: string | null
  status: string
  dataEntrada: string | null
  motivoAtraso: string
  diasAtraso: number
  aderencia: number
  situacao: string
}

export type Kpis = {
  ordensPlanejadas: number
  producaoRealizada: number
  aderenciaPlano: number
  backlog: number
  fillRate: number
  cumprimentoPrazo: number
  opsLiberadas: number
  opsEmProducao: number
  opsAguardandoMaterial: number
  opsAtrasadas: number
  opsParadas: number
  qtdPlanejada: number
  qtdFornecida: number
  qtdProduzida: number
}

const STATUS_LIBERADA = ["Liberada", "Ordem apontada em aberto", "Aguardando apontamento em aberta"]

export function computeKpis(ops: OP[]): Kpis {
  const qtdPlanejada = ops.reduce((a, o) => a + o.planejada, 0)
  const qtdFornecida = ops.reduce((a, o) => a + o.fornecida, 0)
  const qtdProduzida = ops.reduce((a, o) => a + o.produzida, 0)

  const ordensPlanejadas = ops.length
  const producaoRealizada = ops.filter((o) => o.produzida > 0).length
  const opsAtrasadas = ops.filter((o) => o.diasAtraso > 0).length
  const opsEmProducao = ops.filter((o) => o.status === "Em Produção").length
  const opsParadas = ops.filter((o) => o.status === "Parada").length
  const opsAguardandoMaterial = ops.filter((o) => o.fornecida < o.planejada).length
 const opsLiberadas = ops.filter(
  (o) => o.status?.trim().toLowerCase() === "liberada"
).length
  const backlog = qtdPlanejada - qtdProduzida

 const opsFechadas = ops.filter(
  (o) => o.situacao?.trim().toLowerCase() === "fechada"
)

const aderenciaPlano = opsFechadas.length
  ? opsFechadas.filter(
      (o) =>
        o.dataPlanejada &&
        o.dataConclusao &&
        new Date(o.dataConclusao) <= new Date(o.dataPlanejada)
    ).length / opsFechadas.length
  : 0
  const fillRate = qtdPlanejada ? qtdFornecida / qtdPlanejada : 0
  const cumprimentoPrazo = ordensPlanejadas ? (ordensPlanejadas - opsAtrasadas) / ordensPlanejadas : 0

  return {
    ordensPlanejadas,
    producaoRealizada,
    aderenciaPlano,
    backlog,
    fillRate,
    cumprimentoPrazo,
    opsLiberadas,
    opsEmProducao,
    opsAguardandoMaterial,
    opsAtrasadas,
    opsParadas,
    qtdPlanejada,
    qtdFornecida,
    qtdProduzida,
  }
}

export function statusBreakdown(ops: OP[]) {
  const map = new Map<string, number>()
  for (const o of ops) map.set(o.status, (map.get(o.status) ?? 0) + 1)
  return Array.from(map, ([status, qtd]) => ({ status, qtd })).sort((a, b) => b.qtd - a.qtd)
}

export function modeloBreakdown(ops: OP[]) {
  const map = new Map<string, { planejada: number; produzida: number; ops: number }>()
  for (const o of ops) {
    const cur = map.get(o.modelo) ?? { planejada: 0, produzida: 0, ops: 0 }
    cur.planejada += o.planejada
    cur.produzida += o.produzida
    cur.ops += 1
    map.set(o.modelo, cur)
  }
  return Array.from(map, ([modelo, v]) => ({ modelo, ...v })).sort((a, b) => b.planejada - a.planejada)
}

export function motivoBreakdown(ops: OP[]) {
  const map = new Map<string, number>()
  for (const o of ops) {
    if (o.motivoAtraso && o.motivoAtraso !== "-") map.set(o.motivoAtraso, (map.get(o.motivoAtraso) ?? 0) + 1)
  }
  return Array.from(map, ([motivo, qtd]) => ({ motivo, qtd })).sort((a, b) => b.qtd - a.qtd)
}

export function producaoDiaria(ops: OP[]) {
  const map = new Map<string, { planejada: number; produzida: number }>()
  for (const o of ops) {
    if (!o.dataPlanejada) continue
    const day = o.dataPlanejada.slice(0, 10)
    const cur = map.get(day) ?? { planejada: 0, produzida: 0 }
    cur.planejada += o.planejada
    cur.produzida += o.produzida
    map.set(day, cur)
  }
  return Array.from(map, ([data, v]) => ({ data, ...v })).sort((a, b) => a.data.localeCompare(b.data))
}

export function shortModelo(m: string): string {
  if (!m || m === "-") return "Sem modelo"
  const parts = m.split(/[_\s]/)
  return parts[parts.length - 1] || m
}
