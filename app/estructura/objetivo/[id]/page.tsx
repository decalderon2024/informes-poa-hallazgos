import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { ObjectiveDetailView } from '@/components/structure/structure-view'
import { getPlanTree, getPlans, getUnits } from '@/lib/queries'
import { resolvePlanId } from '@/lib/resolve-plan'

export default async function ObjectivePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ plan?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const plans = await getPlans()
  const planId = resolvePlanId(plans, query.plan)
  const tree = planId ? await getPlanTree(planId) : []
  const category = tree.find((item) => item.objectives.some((objective) => objective.id === Number(id)))
  const objective = category?.objectives.find((item) => item.id === Number(id))
  if (!objective || !category) notFound()
  const units = await getUnits()
  return <><PageHeader breadcrumbs={<><Link href={`/estructura?plan=${planId ?? ''}`} className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Categorías</Link><span aria-hidden="true">/</span><Link href={`/estructura/categoria/${category.id}?plan=${planId ?? ''}`} className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{category.name}</Link><span aria-hidden="true">/</span><span className="text-foreground">Objetivos</span></>} title={category.name} description="Gestiona los descriptores y acciones de este objetivo."/><ObjectiveDetailView category={category} objective={objective} units={units} planId={planId ?? 0}/></>
}
