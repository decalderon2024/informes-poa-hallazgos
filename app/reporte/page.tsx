import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { getPlans, getPlanTree } from '@/lib/queries'
import { resolvePlanId } from '@/lib/resolve-plan'
import { planStats } from '@/lib/stats'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { ReportTable } from '@/components/report/report-table'

export default async function ReportePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const plans = await getPlans()
  const planId = resolvePlanId(plans, plan)

  if (!planId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          icon={<CalendarClock size={26} />}
          title="No hay planes registrados"
          description="Crea un Plan Operativo Anual en configuración para generar el reporte."
          action={
            <Link href="/configuracion">
              <Button>Ir a configuración</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const current = plans.find((p) => p.id === planId)!
  const tree = await getPlanTree(planId)
  const stats = planStats(tree)

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Reporte de estado general"
        description={`Vista consolidada del ${current.name}`}
        actions={
          <Badge variant="info" className="text-sm">
            Cumplimiento global {stats.overall}%
          </Badge>
        }
      />
      <div className="mt-6">
        <ReportTable tree={tree} />
      </div>
    </div>
  )
}
