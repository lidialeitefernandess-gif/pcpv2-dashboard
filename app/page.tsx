import { loadPcpData, loadConsumoZpp009 } from "@/lib/pcp-data"
import { Dashboard } from "@/components/dashboard"
import { AutoRefresh } from "@/components/auto-refresh"

export default async function Page() {
  const { ops, modelos, atualizadoEm } = await loadPcpData()
  const consumoZpp009 = await loadConsumoZpp009()

  return (
    <main className="min-h-screen bg-background">
      <AutoRefresh />

      <Dashboard
        ops={ops}
        modelos={modelos}
        atualizadoEm={atualizadoEm}
        consumoZpp009={consumoZpp009}
      />
    </main>
  )
}