import Link from 'next/link'
import {
  FolderTree,
  Target,
  ListChecks,
  MessageSquareText,
  TrendingUp,
  ArrowRight,
  CalendarClock,
} from 'lucide-react'
import { getPlans, getPlanTree } from '@/lib/queries'
import { resolvePlanId } from '@/lib/resolve-plan'
import { planStats, categoryProgress } from '@/lib/stats'
import { CATEGORY_COLORS, type CategoryColor, MONTHS } from '@/lib/constants'
import { Card, CardBody, CardHeader } from '@/components/card'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { ProgressBar } from '@/components/progress-bar'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

export default async function PanelPage({
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
          title="Aún no hay planes registrados"
          description="Crea tu primer Plan Operativo Anual desde la sección de configuración para comenzar a registrar categorías, objetivos y acciones."
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

  const recent = tree
    .flatMap((c) =>
      c.objectives.flatMap((o) =>
        o.descriptors.flatMap((d) =>
          d.actions.flatMap((a) =>
            a.followUps.map((f) => ({
              ...f,
              actionDescription: a.description,
              category: c.name,
              color: c.color,
            })),
          ),
        ),
      ),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)

  const statCards = [
    { label: 'Categorías', value: stats.categories, icon: FolderTree },
    { label: 'Objetivos', value: stats.objectives, icon: Target },
    { label: 'Acciones', value: stats.actions, icon: ListChecks },
    { label: 'Seguimientos', value: stats.followUps, icon: MessageSquareText },
  ]

  const distItems = [
    { key: 'completado', label: 'Completado', value: stats.dist.completado, cls: 'bg-green-500' },
    { key: 'enAvance', label: 'En avance', value: stats.dist.enAvance, cls: 'bg-teal-500' },
    { key: 'enProceso', label: 'En proceso', value: stats.dist.enProceso, cls: 'bg-blue-700' },
    { key: 'sinIniciar', label: 'Sin iniciar', value: stats.dist.sinIniciar, cls: 'bg-muted-foreground/40' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Panel de seguimiento"
        description={`Resumen del ${current.name}`}
        actions={
          <Link href={`/reporte?plan=${planId}`}>
            <Button variant="outline" size="sm">
              Ver reporte
              <ArrowRight size={16} />
            </Button>
          </Link>
        }
      />

      {/* Hero + progress */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card variant="gradient" className="lg:col-span-2">
          <CardBody className="flex flex-col gap-6 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <TrendingUp size={14} />
                Cumplimiento global
              </div>
              <p className="text-5xl font-bold tabular-nums">{stats.overall}%</p>
              <p className="mt-2 max-w-sm text-sm text-white/85">
                Promedio de cumplimiento de las {stats.actions} acciones
                registradas en el plan.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Stat label="Objetivos" value={stats.objectives} />
              <div className="h-12 w-px bg-white/20" />
              <Stat label="Descriptores" value={stats.descriptors} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Estado de acciones</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {stats.actions === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sin acciones registradas.
              </p>
            ) : (
              distItems.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${d.cls}`} />
                  <span className="flex-1 text-sm text-foreground">{d.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {d.value}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700/10 to-teal-500/15 text-blue-700 dark:text-teal-400">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        {/* Progress by category */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="text-base font-semibold">Avance por categoría</h2>
            <Link
              href={`/estructura?plan=${planId}`}
              className="text-xs font-semibold text-blue-700 hover:underline dark:text-teal-400"
            >
              Editar estructura
            </Link>
          </CardHeader>
          <CardBody className="space-y-5">
            {tree.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No hay categorías. Comienza en la sección Estructura.
              </p>
            ) : (
              tree.map((c) => {
                const color = (CATEGORY_COLORS[c.color as CategoryColor] ??
                  CATEGORY_COLORS.blue)
                const pct = categoryProgress(c)
                const actionCount = c.objectives.reduce(
                  (s, o) =>
                    s + o.descriptors.reduce((ss, d) => ss + d.actions.length, 0),
                  0,
                )
                return (
                  <div key={c.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} />
                        <span className="truncate text-sm font-medium text-foreground">
                          {c.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {actionCount} acc.
                        </span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                )
              })
            )}
          </CardBody>
        </Card>

        {/* Recent follow-ups */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-base font-semibold">Seguimientos recientes</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {recent.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Todavía no hay seguimientos.
              </p>
            ) : (
              recent.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {MONTHS[r.month - 1]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.actionDescription}
                    </p>
                    {r.executionComment && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {r.executionComment}
                      </p>
                    )}
                    <Badge variant="info" className="mt-1.5">
                      {r.category}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  )
}
