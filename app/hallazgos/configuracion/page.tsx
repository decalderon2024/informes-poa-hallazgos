import { PageHeader } from '@/components/page-header'
import { FindingConfig } from '@/components/findings/finding-config'
import { getFindingReports } from '@/lib/findings-queries'

export const dynamic = 'force-dynamic'

export default async function HallazgosConfigPage() {
  const reports = await getFindingReports()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Configuración de hallazgos" description="Administra los informes anuales de seguimiento de hallazgos." />
      <div className="mt-6"><FindingConfig reports={reports} /></div>
    </div>
  )
}
