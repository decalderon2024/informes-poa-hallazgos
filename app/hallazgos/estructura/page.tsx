import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { FindingStructure } from '@/components/findings/finding-structure'
import { getFindingReports, getFindings } from '@/lib/findings-queries'
import { resolveFindingReportId } from '@/lib/findings'

export default async function HallazgosStructurePage({ searchParams }: { searchParams: Promise<{ informe?: string }> }) {
  const { informe } = await searchParams
  const reports = await getFindingReports()
  const reportId = resolveFindingReportId(reports, informe)
  const report = reports.find((item) => item.id === reportId)
  const findings = reportId ? await getFindings(reportId) : []
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Estructura de hallazgos" description={report ? `Registra y edita los hallazgos de ${report.name}.` : 'Crea un informe para empezar a registrar hallazgos.'} />
      <div className="mt-6">
        {report ? <FindingStructure report={report} findings={findings} /> : (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Todavía no hay informes de hallazgos.</p>
            <Link href="/hallazgos/configuracion" className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Crear informe</Link>
          </div>
        )}
      </div>
    </div>
  )
}
