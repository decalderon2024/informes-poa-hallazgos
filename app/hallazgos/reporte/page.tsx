import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { FindingReportView } from '@/components/findings/finding-report'
import { Badge } from '@/components/badge'
import { getFindingReports, getFindings } from '@/lib/findings-queries'
import { findingStats, resolveFindingReportId } from '@/lib/findings'

export default async function HallazgosReportPage({ searchParams }: { searchParams: Promise<{ informe?: string }> }) {
  const { informe } = await searchParams
  const reports = await getFindingReports()
  const reportId = resolveFindingReportId(reports, informe)
  const report = reports.find((item) => item.id === reportId)
  const findings = reportId ? await getFindings(reportId) : []
  const stats = findingStats(findings)
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Reporte de hallazgos"
        description={report ? `Seguimiento de ${report.name}` : 'Crea un informe para registrar y consultar hallazgos.'}
        actions={report ? <Badge variant="info" className="text-sm">Corrección {stats.correctionRate}%</Badge> : undefined}
      />
      <div className="mt-6">
        {report ? <FindingReportView findings={findings} reportId={report.id} /> : (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Todavía no hay informes de hallazgos.</p>
            <Link href="/hallazgos/configuracion" className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Crear informe</Link>
          </div>
        )}
      </div>
    </div>
  )
}
