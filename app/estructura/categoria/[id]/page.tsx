import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { ObjectivesView } from '@/components/structure/level-views'
import { getPlanTree, getPlans } from '@/lib/queries'
import { resolvePlanId } from '@/lib/resolve-plan'

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ plan?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const plans = await getPlans()
  const planId = resolvePlanId(plans, query.plan)
  const category = (planId ? await getPlanTree(planId) : []).find((item) => item.id === Number(id))
  if (!category) notFound()
  return <><PageHeader breadcrumbs={<><Link href={`/estructura?plan=${planId ?? ''}`} className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Categorías</Link><span aria-hidden="true">/</span><span className="text-foreground">{category.name}</span><span aria-hidden="true">/</span><span className="text-foreground">Objetivos</span></>} title={category.name} description="Gestiona los objetivos asociados a esta categoría."/><ObjectivesView category={category} planId={planId ?? 0}/></>
}
