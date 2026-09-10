"use client"

import { useMemo, useState } from "react"

type ConsumoItem = {
  op: string
  material: string
  descricao: string
  classe: string
  qtdNecessaria: number
  qtdConsumida: number
  qtdPendente: number
  status: string
}

type Props = {
  dados: ConsumoItem[]
}

export function ConsumoZpp009({ dados }: Props) {
  const [classeSelecionada, setClasseSelecionada] = useState<
    "A" | "B" | "C" | "TODAS"
  >("TODAS")

const pendentes = useMemo(() => {
  return dados.filter((item) => {
    const statusAtual = item.status?.trim().toUpperCase() ?? ""
    const classeAtual = item.classe?.trim().toUpperCase() ?? ""

    return (
      (statusAtual === "SEM CONSUMO" ||
        statusAtual === "PARCIAL") &&
      ["A", "B", "C"].includes(classeAtual)
    )
  })
}, [dados])

  const resumo = useMemo(() => {
    const calcular = (classe: "A" | "B" | "C") => {
      const itens = pendentes.filter(
        (item) =>
          item.classe?.trim().toUpperCase() === classe
      )

      const opsUnicas = new Set(
        itens
          .map((item) => item.op)
          .filter(Boolean)
      ).size

      const linhasPendentes = itens.length

     return {
  materiais: linhasPendentes,
  ops: opsUnicas,
}
    }

    return {
      A: calcular("A"),
      B: calcular("B"),
      C: calcular("C"),
    }
  }, [pendentes])

  const dadosFiltrados = useMemo(() => {
    if (classeSelecionada === "TODAS") {
      return pendentes
    }

    return pendentes.filter(
      (item) =>
        item.classe?.trim().toUpperCase() ===
        classeSelecionada
    )
  }, [pendentes, classeSelecionada])

  const dadosExibidos = dadosFiltrados.slice(0, 100)

  const classes = [
    {
      classe: "A" as const,
      titulo: "Classe A",
      subtitulo: "Prioridade alta",
    },
    {
      classe: "B" as const,
      titulo: "Classe B",
      subtitulo: "Prioridade média",
    },
    {
      classe: "C" as const,
      titulo: "Classe C",
      subtitulo: "Prioridade baixa",
    },
  ]

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          Pendências de Consumo — ZPP009
        </h2>

        <p className="text-sm text-muted-foreground">
          Materiais que ainda possuem consumo pendente nas ordens de produção
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {classes.map(
          ({ classe, titulo, subtitulo }) => (
            <button
              key={classe}
              type="button"
              onClick={() =>
                setClasseSelecionada(classe)
              }
              className={`rounded-xl border bg-card p-5 text-left transition hover:border-primary ${
                classeSelecionada === classe
                  ? "border-primary"
                  : ""
              }`}
            >
              <div className="mb-4">
                <p className="text-sm font-medium">
                  {titulo}
                </p>

                <p className="text-xs text-muted-foreground">
                  {subtitulo}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold tabular-nums">
                    {resumo[
                      classe
                    ].materiais.toLocaleString(
                      "pt-BR"
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    pendências
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-semibold tabular-nums">
                    {resumo[
                      classe
                    ].ops.toLocaleString(
                      "pt-BR"
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    OPs com pendência
                  </p>
                </div>
              </div>
            </button>
          )
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setClasseSelecionada("TODAS")
              }
              className={`rounded-md border px-3 py-1.5 text-sm ${
                classeSelecionada === "TODAS"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              Todas
            </button>

            {(["A", "B", "C"] as const).map(
              (classe) => (
                <button
                  key={classe}
                  type="button"
                  onClick={() =>
                    setClasseSelecionada(
                      classe
                    )
                  }
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    classeSelecionada === classe
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                >
                  Classe {classe}
                </button>
              )
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Mostrando{" "}
            {Math.min(
              100,
              dadosFiltrados.length
            ).toLocaleString("pt-BR")}{" "}
            de{" "}
            {dadosFiltrados.length.toLocaleString(
              "pt-BR"
            )}{" "}
            materiais
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">OP</th>
                <th className="p-3">Data</th>
                <th className="p-3">
                  Material
                </th>
                <th className="p-3">
                  Descrição
                </th>
                <th className="p-3">
                  Classe
                </th>
                <th className="p-3 text-right">
                  Necessário
                </th>
                <th className="p-3 text-right">
                  Consumido
                </th>
                <th className="p-3 text-right">
                  Pendente
                </th>
                <th className="p-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {dadosExibidos.map(
                (item, index) => (
                  <tr
                    key={`${item.op}-${item.material}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-3 font-mono">
                      {item.op}
                      <td className="p-3">
  {item.data}
</td>
                    </td>

                    <td className="p-3">
                      {item.material}
                    </td>

                    <td className="p-3">
                      {item.descricao}
                    </td>

                    <td className="p-3">
                      {item.classe}
                    </td>

                    <td className="p-3 text-right">
                      {item.qtdNecessaria.toLocaleString(
                        "pt-BR"
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {item.qtdConsumida.toLocaleString(
                        "pt-BR"
                      )}
                    </td>

                    <td className="p-3 text-right font-semibold">
                      {item.qtdPendente.toLocaleString(
                        "pt-BR"
                      )}
                    </td>

                    <td className="p-3">
                      {item.status}
                    </td>
                  </tr>
                )
              )}

              {dadosFiltrados.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Nenhuma pendência encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
