import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { ActionDetail } from '@/components/structure/action-detail'
import { getPlanTree, getPlans } from '@/lib/queries'

export default async function ActionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plans = await getPlans()
  const tree = plans.length ? await getPlanTree(plans[plans.length - 1].id) : []
  const action = tree.flatMap((c) => c.objectives).flatMap((o) => o.descriptors).flatMap((d) => d.actions).find((item) => item.id === Number(id))
  if (!action) notFound()
  return <><PageHeader breadcrumbs={<><Link href="/estructura" className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Categorías</Link><span aria-hidden="true">/</span><Link href="/estructura" className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Objetivos</Link><span aria-hidden="true">/</span><span className="text-foreground">Seguimientos</span></>} title="Seguimientos" description={action.description}/><ActionDetail action={action} open onClose={() => {}}/></>
}
