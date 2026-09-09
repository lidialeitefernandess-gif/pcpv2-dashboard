import "server-only"
import type { OP } from "./pcp-kpis"

const SPREADSHEET_ID = "1B6v9Xjyc3YUXnkJp6zfnL6N_p-nOK1Yq54U6Ivm_NmE"
const SHEET_NAME = "BASE_OP"
const CONSUMO_SHEET_NAME = "CONSUMO_ZPP009"
export type PcpData = {
  ops: OP[]
  modelos: string[]
  atualizadoEm: string
}
export type ConsumoZpp009Item = {
  op: string
  material: string
  descricao: string
  classe: string
  qtdNecessaria: number
  qtdConsumida: number
  qtdPendente: number
  status: string
}

function toISO(v: unknown): string | null {
  if (!v) return null

  const value = String(v).trim()
  if (!value) return null

  const brDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (brDate) {
    const [, day, month, year] = brDate
    const d = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    )

    return isNaN(d.getTime()) ? null : d.toISOString()
  }

  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0

  const value = String(v)
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")

  const n = Number(value)
  return isNaN(n) ? 0 : n
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && insideQuotes && next === '"') {
      field += '"'
      i++
      continue
    }

    if (char === '"') {
      insideQuotes = !insideQuotes
      continue
    }

    if (char === "," && !insideQuotes) {
      row.push(field)
      field = ""
      continue
    }

    if (char === "\n" && !insideQuotes) {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      continue
    }

    if (char !== "\r") {
      field += char
    }
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

let cache: {
  data: PcpData
  timestamp: number
} | null = null

const CACHE_TIME = 1 * 60 * 1000

export async function loadPcpData(): Promise<PcpData> {
  const now = Date.now()

  if (cache && now - cache.timestamp < CACHE_TIME) {
    return cache.data
  }

  const url =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq` +
    `?sheet=${encodeURIComponent(SHEET_NAME)}` +
    `&tqx=out:csv`

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Não foi possível acessar a Google Sheets. Status: ${response.status}`,
    )
  }

  const csv = await response.text()
  const rows = parseCSV(csv)

  if (!rows.length) {
    throw new Error("A aba BASE_OP está vazia.")
  }

  const headers = rows[0].map((header) => header.trim())
  const dataRows = rows.slice(1)

  const records = dataRows.map((row) => {
    const record: Record<string, string> = {}

    headers.forEach((header, index) => {
      record[header] = row[index] ?? ""
    })

    return record
  })

  const ops: OP[] = records
    .filter(
      (r) =>
        r["OP"] != null &&
        String(r["OP"]).trim() !== "",
    )
    .map((r) => ({
      op: String(r["OP"]).trim(),
      material: String(r["Material"] ?? "-").trim() || "-",
      modelo: String(r["Modelo"] ?? "-").trim() || "-",

      planejada: num(r["Qtd. Planejada"]),
      fornecida: num(r["Qtd. Fornecida"]),
      produzida: num(r["Qtd. Produzida"]),

      dataPlanejada: toISO(r["Data Planejada"]),
      dataConclusao: toISO(r["Data de conclusão base"]),

      status:
        String(r["Status"] ?? "").trim() ||
        "Sem status",

      dataEntrada: toISO(r["Data de entrada"]),

      motivoAtraso:
        String(r["Motivo do Atraso"] ?? "-").trim() ||
        "-",

      diasAtraso: num(r["Dias de Atraso"]),
      aderencia: num(r["Aderência"]),

      situacao:
        String(r["Fechada/ Aberta"] ?? "").trim() ||
        "-",
    }))

  const modelos = Array.from(
    new Set(ops.map((o) => o.modelo)),
  ).sort()

  const data: PcpData = {
    ops,
    modelos,
    atualizadoEm: new Date().toISOString(),
  }

  cache = {
    data,
    timestamp: now,
  }

  return data
}

 export async function loadConsumoZpp009(): Promise<ConsumoZpp009Item[]> {
  const url =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?` +
    `sheet=${encodeURIComponent(CONSUMO_SHEET_NAME)}` +
    `&tqx=out:csv`

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Não foi possível acessar a aba CONSUMO_ZPP009. Status: ${response.status}`
    )
  }

 const csv = await response.text()
const rows = parseCSV(csv)

if (!rows.length) {
  return []
}

const headers = rows[0].map((h) => h.trim().toUpperCase())

const idxOP = headers.indexOf("OP")
const idxSAP = headers.indexOf("SAP")
const idxDescricao = headers.indexOf("DESCRIÇÃO")
const idxClasse = headers.indexOf("CLASSE A/B/C")
const idxBOM = headers.indexOf("BOM")
const idxConsumo = headers.indexOf("CONSUMO 261")
const idxStatus = headers.indexOf("STATUS")

const dataRows = rows.slice(1)

return dataRows
  .filter((row) => String(row[idxOP] ?? "").trim() !== "")
  .map((row) => {
    const op = String(row[idxOP] ?? "").trim()
    const material = String(row[idxSAP] ?? "").trim()
    const descricao = String(row[idxDescricao] ?? "").trim()

    const classe = String(row[idxClasse] ?? "")
      .trim()
      .toUpperCase()

    const necessario = num(row[idxBOM])
const consumido = num(row[idxConsumo])

const status = String(row[idxStatus] ?? "")
  .trim()
  .toUpperCase()

      // Quantidade ainda pendente
      const pendente = Math.max(
        0,
        necessario - Math.abs(consumido)
      )

      return {
        op,
        material,
        descricao,
        classe,
        qtdNecessaria: necessario,
        qtdConsumida: Math.abs(consumido),
        qtdPendente: pendente,
       status,
      }
    })
    .filter(
  (item) =>
    ["A", "B", "C"].includes(item.classe)
)
}