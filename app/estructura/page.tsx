import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { CategoriesView } from '@/components/structure/level-views'
import { getPlanTree, getPlans } from '@/lib/queries'
import { resolvePlanId } from '@/lib/resolve-plan'

export default async function EstructuraPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const params = await searchParams
  const [plans] = await Promise.all([getPlans()])
  const planId = resolvePlanId(plans, params.plan)
  const tree = planId ? await getPlanTree(planId) : []
  return <><PageHeader breadcrumbs={<><Link href="/" className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Inicio</Link><span aria-hidden="true">/</span><Link href="/estructura" className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Estructura</Link><span aria-hidden="true">/</span><span className="text-foreground">Categorías</span></>} title="Categorías" description="Selecciona un año y comienza a navegar por la estructura del plan."/><CategoriesView categories={tree} plans={plans} planId={planId ?? 0}/></>
}
