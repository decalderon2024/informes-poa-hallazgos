import { getPlans, getUnits } from '@/lib/queries'
import { PageHeader } from '@/components/page-header'
import { ConfigView } from '@/components/config-view'

export default async function ConfiguracionPage() {
  const [plans, units] = await Promise.all([getPlans(), getUnits()])
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Configuración"
        description="Administra los Planes Operativos Anuales y las unidades operativas responsables."
      />
      <div className="mt-6">
        <ConfigView plans={plans} units={units} />
      </div>
    </div>
  )
}
