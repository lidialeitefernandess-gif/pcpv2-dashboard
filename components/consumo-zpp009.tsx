"use client"

import { useMemo, useState } from "react"
import type { ConsumoZpp009Item } from "@/lib/pcp-data"

type Props = { dados: ConsumoZpp009Item[] }
type Classe = "A" | "B" | "C" | "TODAS"
type StatusFiltro = "TODOS" | "SEM CONSUMO" | "PARCIAL"

export function ConsumoZpp009({ dados }: Props) {
  const [classeSelecionada, setClasseSelecionada] = useState<Classe>("TODAS")
  const [statusSelecionado, setStatusSelecionado] = useState<StatusFiltro>("TODOS")
  const [busca, setBusca] = useState("")
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")

  const pendentes = useMemo(() => dados.filter((item) => {
    const status = item.status?.trim().toUpperCase() ?? ""
    const classe = item.classe?.trim().toUpperCase() ?? ""
    return (status === "SEM CONSUMO" || status === "PARCIAL") && ["A", "B", "C"].includes(classe)
  }), [dados])

  const dataParaISO = (valor: string) => {
    const texto = String(valor ?? "").trim()
    const br = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (br) return `${br[3]}-${br[2]}-${br[1]}`
    const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
    return ""
  }

  // Status, período e busca afetam tanto os cards quanto a tabela.
  const baseFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return pendentes.filter((item) => {
      const statusOk = statusSelecionado === "TODOS" || item.status?.trim().toUpperCase() === statusSelecionado
      const dataItem = dataParaISO(item.data)
      const dataInicialOk = !dataInicial || (!!dataItem && dataItem >= dataInicial)
      const dataFinalOk = !dataFinal || (!!dataItem && dataItem <= dataFinal)
      const buscaOk = !termo || [item.op, item.material, item.descricao, item.data]
        .some((v) => String(v ?? "").toLowerCase().includes(termo))
      return statusOk && dataInicialOk && dataFinalOk && buscaOk
    })
  }, [pendentes, statusSelecionado, dataInicial, dataFinal, busca])

  const resumo = useMemo(() => {
    const calcular = (classe: "A" | "B" | "C") => {
      const itens = baseFiltrada.filter((item) => item.classe?.trim().toUpperCase() === classe)
      return {
        materiais: itens.length,
        ops: new Set(itens.map((item) => item.op).filter(Boolean)).size,
        pendente: itens.reduce((total, item) => total + item.qtdPendente, 0),
      }
    }
    return { A: calcular("A"), B: calcular("B"), C: calcular("C") }
  }, [baseFiltrada])

  const dadosFiltrados = useMemo(() => {
    if (classeSelecionada === "TODAS") return baseFiltrada
    return baseFiltrada.filter((item) => item.classe?.trim().toUpperCase() === classeSelecionada)
  }, [baseFiltrada, classeSelecionada])

  const dadosExibidos = dadosFiltrados.slice(0, 100)
  const classes = [
    { classe: "A" as const, titulo: "Classe A", subtitulo: "Prioridade alta" },
    { classe: "B" as const, titulo: "Classe B", subtitulo: "Prioridade média" },
    { classe: "C" as const, titulo: "Classe C", subtitulo: "Prioridade baixa" },
  ]

  return (
    <section className="mt-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pendências de Consumo — ZPP009</h2>
        <p className="text-sm text-muted-foreground">Materiais que ainda possuem consumo pendente nas ordens de produção</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {classes.map(({ classe, titulo, subtitulo }) => (
          <button key={classe} type="button" onClick={() => setClasseSelecionada(classe)}
            className={`rounded-xl border bg-card p-5 text-left transition hover:border-primary ${classeSelecionada === classe ? "border-primary" : ""}`}>
            <div className="mb-4"><p className="text-sm font-medium">{titulo}</p><p className="text-xs text-muted-foreground">{subtitulo}</p></div>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-3xl font-bold tabular-nums">{resumo[classe].materiais.toLocaleString("pt-BR")}</p><p className="text-xs text-muted-foreground">pendências</p></div>
              <div className="text-right"><p className="text-xl font-semibold tabular-nums">{resumo[classe].ops.toLocaleString("pt-BR")}</p><p className="text-xs text-muted-foreground">OPs com pendência</p></div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["TODAS", "A", "B", "C"] as const).map((classe) => (
              <button key={classe} type="button" onClick={() => setClasseSelecionada(classe)}
                className={`rounded-md border px-3 py-1.5 text-sm ${classeSelecionada === classe ? "bg-primary text-primary-foreground" : ""}`}>
                {classe === "TODAS" ? "Todas as classes" : `Classe ${classe}`}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Mostrando {Math.min(100, dadosFiltrados.length).toLocaleString("pt-BR")} de {dadosFiltrados.length.toLocaleString("pt-BR")} materiais</p>
        </div>

        <div className="flex flex-wrap gap-3 border-b p-4">
          <select value={statusSelecionado} onChange={(e) => setStatusSelecionado(e.target.value as StatusFiltro)} className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="TODOS">Todos os status pendentes</option>
            <option value="SEM CONSUMO">Sem consumo</option>
            <option value="PARCIAL">Parcial</option>
          </select>

          <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
            <span className="text-muted-foreground">De</span>
            <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className="bg-transparent outline-none" />
          </label>

          <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
            <span className="text-muted-foreground">Até</span>
            <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className="bg-transparent outline-none" />
          </label>

          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar OP, material, descrição ou data..." className="min-w-[280px] flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
          <button type="button" onClick={() => { setClasseSelecionada("TODAS"); setStatusSelecionado("TODOS"); setDataInicial(""); setDataFinal(""); setBusca("") }} className="rounded-md border px-3 py-2 text-sm">Limpar filtros</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left">
              <th className="p-3">OP</th><th className="p-3">Data</th><th className="p-3">Material</th><th className="p-3">Descrição</th><th className="p-3">Classe</th>
              <th className="p-3 text-right">Necessário</th><th className="p-3 text-right">Consumido</th><th className="p-3 text-right">Pendente</th><th className="p-3">Status</th>
            </tr></thead>
            <tbody>
              {dadosExibidos.map((item, index) => (
                <tr key={`${item.op}-${item.material}-${index}`} className="border-b last:border-0">
                  <td className="p-3 font-mono">{item.op}</td><td className="p-3">{item.data}</td><td className="p-3">{item.material}</td><td className="p-3">{item.descricao}</td><td className="p-3">{item.classe}</td>
                  <td className="p-3 text-right">{item.qtdNecessaria.toLocaleString("pt-BR")}</td><td className="p-3 text-right">{item.qtdConsumida.toLocaleString("pt-BR")}</td><td className="p-3 text-right font-semibold">{item.qtdPendente.toLocaleString("pt-BR")}</td><td className="p-3">{item.status}</td>
                </tr>
              ))}
              {dadosFiltrados.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Nenhuma pendência encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
