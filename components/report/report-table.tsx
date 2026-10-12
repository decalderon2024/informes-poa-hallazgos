'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Filter, Plus, Printer, Search, X } from 'lucide-react'
import { createObservation, setActionMonthStatus } from '@/app/actions'
import type { ActionNode, CategoryNode, DescriptorNode, ObjectiveNode } from '@/lib/types'
import {
  MONTHS,
  MONTHS_LONG,
  progressTone,
} from '@/lib/constants'
import { monthlyCompletionPercentage, plannedMonthCount } from '@/lib/stats'
import { cn } from '@/lib/utils'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'

type ActionEntry = { descriptor: DescriptorNode; action: ActionNode }
type ObjectiveGroup = { objective: ObjectiveNode; entries: ActionEntry[] }
type CategoryGroup = { category: CategoryNode; objectives: ObjectiveGroup[]; count: number }

const STATUS_FILTERS = ['Sin iniciar', 'Iniciado', 'En proceso', 'En avance', 'Completado'] as const

export function ReportTable({ tree }: { tree: CategoryNode[] }) {
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [responsibleFilter, setResponsibleFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [search, setSearch] = React.useState('')
  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set())
  const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(() => new Set())
  const [expandedObjectives, setExpandedObjectives] = React.useState<Set<number>>(() => new Set())
  const [collapsedFilteredCategories, setCollapsedFilteredCategories] = React.useState<Set<number>>(() => new Set())
  const [collapsedFilteredObjectives, setCollapsedFilteredObjectives] = React.useState<Set<number>>(() => new Set())

  React.useEffect(() => {
    setCollapsedFilteredCategories(new Set())
    setCollapsedFilteredObjectives(new Set())
  }, [categoryFilter, responsibleFilter, statusFilter, search])

  const responsibleNames = Array.from(
    new Set(
      tree.flatMap((category) =>
        category.objectives.flatMap((objective) =>
          objective.descriptors.flatMap((descriptor) =>
            descriptor.actions.map((action) => action.executionUnitName).filter((name): name is string => !!name),
          ),
        ),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b, 'es'))

  const totalActions = tree.reduce(
    (count, category) =>
      count + category.objectives.reduce(
        (objectiveCount, objective) =>
          objectiveCount + objective.descriptors.reduce(
            (descriptorCount, descriptor) => descriptorCount + descriptor.actions.length,
            0,
          ),
        0,
      ),
    0,
  )

  const query = search.trim().toLocaleLowerCase('es-GT')
  const hasActionFilters = responsibleFilter !== 'all' || statusFilter !== 'all' || query !== ''
  const hasFilters = categoryFilter !== 'all' || hasActionFilters
  const groups: CategoryGroup[] = tree
    .filter((category) => categoryFilter === 'all' || String(category.id) === categoryFilter)
    .map((category) => {
      const objectives = category.objectives
        .map((objective): ObjectiveGroup => ({
          objective,
          entries: objective.descriptors.flatMap((descriptor) =>
            descriptor.actions
              .filter((action) => {
                if (responsibleFilter !== 'all' && action.executionUnitName !== responsibleFilter) return false
                if (statusFilter !== 'all' && progressTone(action.completionPercentage).label !== statusFilter) return false
                if (!query) return true
                return [category.name, objective.text, descriptor.text, descriptor.initiative, descriptor.indicator, action.description, action.executionUnitName]
                  .some((value) => value?.toLocaleLowerCase('es-GT').includes(query))
              })
              .map((action) => ({ descriptor, action })),
          ),
        }))
        .filter((group) => group.entries.length > 0 || !hasActionFilters)
      return {
        category,
        objectives,
        count: objectives.reduce((count, group) => count + group.entries.length, 0),
      }
    })
    .filter((group) => group.objectives.length > 0 || (!hasActionFilters && group.category.objectives.length === 0))

  const visibleActions = groups.reduce((count, group) => count + group.count, 0)

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) => {
    setter((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm print:hidden">
        <div className="grid gap-3 min-[480px]:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(150px,1fr))_auto] xl:items-end">
          <div className="min-[480px]:col-span-2 xl:col-span-1"><Input label="Buscar" icon={<Search size={16} />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Acción, objetivo o indicador" /></div>
          <Select label="Categoría" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Todas las categorías</option>
            {tree.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
          <Select label="Responsable" value={responsibleFilter} onChange={(event) => setResponsibleFilter(event.target.value)}>
            <option value="all">Todos los responsables</option>
            {responsibleNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
          <Select label="Avance" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos los estados</option>
            {STATUS_FILTERS.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-11 min-[480px]:col-span-2 xl:col-span-1">
            <Printer size={15} />Imprimir
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
          <Filter size={13} /> Mostrando {visibleActions} de {totalActions} acciones
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <p className="font-semibold text-foreground">No se encontraron acciones</p>
          <p className="mt-1 text-sm text-muted-foreground">Probá con otra búsqueda o cambiá los filtros.</p>
        </div>
      ) : groups.map(({ category, objectives, count }) => {
        const categoryOpen = hasFilters ? !collapsedFilteredCategories.has(category.id) : expandedCategories.has(category.id)
        return (
          <section key={category.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm print:break-inside-avoid">
            <h2>
              <button type="button" aria-expanded={categoryOpen} aria-controls={`report-category-${category.id}`} onClick={() => toggleSet(hasFilters ? setCollapsedFilteredCategories : setExpandedCategories, category.id)} className={cn('flex w-full items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 sm:px-5', categoryOpen && 'border-b border-border')}>
                <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                  <Badge variant="info" className="shrink-0 px-2 py-1 text-[10px] uppercase tracking-wide">Categoría</Badge>
                  <span className="min-w-0 text-pretty">{category.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {count} {count === 1 ? 'acción' : 'acciones'}
                  <ChevronDown size={16} className={cn('transition-transform', categoryOpen && 'rotate-180')} aria-hidden="true" />
                </span>
              </button>
            </h2>
            <div id={`report-category-${category.id}`} className={cn(!categoryOpen && 'hidden print:block')}>
            {objectives.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground sm:px-5">Sin objetivos registrados.</p>
            ) : objectives.map(({ objective, entries }) => {
              const objectiveOpen = hasFilters ? !collapsedFilteredObjectives.has(objective.id) : expandedObjectives.has(objective.id)
              return (
              <section key={objective.id} className="border-b border-border last:border-b-0">
                <h3>
                  <button type="button" aria-expanded={objectiveOpen} aria-controls={`report-objective-${objective.id}`} onClick={() => toggleSet(hasFilters ? setCollapsedFilteredObjectives : setExpandedObjectives, objective.id)} className={cn('flex w-full items-center justify-between gap-3 bg-muted/15 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 sm:px-5', objectiveOpen && 'border-b border-border')}>
                    <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      <Badge variant="neutral" className="shrink-0 px-2 py-1 text-[10px] uppercase tracking-wide">Objetivo</Badge>
                      <span className="min-w-0 text-pretty">{objective.text}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {entries.length} {entries.length === 1 ? 'acción' : 'acciones'}
                      <ChevronDown size={16} className={cn('transition-transform', objectiveOpen && 'rotate-180')} aria-hidden="true" />
                    </span>
                  </button>
                </h3>
                <div id={`report-objective-${objective.id}`} className={cn(!objectiveOpen && 'hidden print:block')}>
                {entries.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-muted-foreground sm:px-5">Sin acciones registradas.</p>
                ) : (
                  <div>
                    <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)_100px_125px_105px] gap-3 border-y border-border bg-muted/40 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:grid" aria-hidden="true">
                      <span>Acción</span><span>Responsable</span><span>Período</span><span>Cumplimiento</span><span>Detalle</span>
                    </div>
                    <ul className="space-y-3 bg-muted/25 p-3 sm:p-4">
                      {entries.map(({ descriptor, action }, index) => {
                        const tone = progressTone(action.completionPercentage)
                        const isExpanded = expanded.has(action.id)
                        return (
                          <li key={action.id} className={cn('overflow-hidden rounded-xl border bg-card shadow-sm print:break-inside-avoid print:shadow-none', isExpanded ? 'border-teal-500/50' : 'border-border')}>
                            <div onClick={() => toggleSet(setExpanded, action.id)} className={cn('grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-sidebar-accent/40 sm:px-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)_100px_125px_105px] lg:items-center', isExpanded && 'bg-sidebar-accent/30')}>
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold tabular-nums text-sidebar-accent-foreground" aria-label={`Acción ${index + 1}`}>{index + 1}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground text-pretty">{action.description}</p>
                                  <p className="mt-1 text-xs text-muted-foreground text-pretty">{descriptor.text}</p>
                                </div>
                              </div>
                              <div><span className="mr-1 text-xs font-medium text-muted-foreground lg:hidden">Responsable:</span><span className="text-xs text-foreground">{action.executionUnitName ?? 'Sin asignar'}</span></div>
                              <div><span className="mr-1 text-xs font-medium text-muted-foreground lg:hidden">Período:</span><span className="whitespace-nowrap text-xs text-foreground">{action.startMonth && action.endMonth ? `${MONTHS[action.startMonth - 1]}–${MONTHS[action.endMonth - 1]}` : 'Sin definir'}</span></div>
                              <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground lg:hidden">Cumplimiento:</span><Badge variant={tone.badge} className="tabular-nums" title="Calculado según los meses cumplidos">{action.completionPercentage}%</Badge></div>
                              <button type="button" aria-expanded={isExpanded} aria-controls={`report-detail-${action.id}`} onClick={(event) => { event.stopPropagation(); toggleSet(setExpanded, action.id) }} className="inline-flex min-h-9 items-center gap-1 justify-self-start rounded-md text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 print:hidden">
                                {isExpanded ? 'Ocultar' : 'Ver detalle'}<ChevronDown size={14} className={cn('transition-transform', isExpanded && 'rotate-180')} />
                              </button>
                            </div>
                            {isExpanded && <ActionDetails action={action} descriptor={descriptor} />}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                </div>
              </section>
              )
            })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ActionDetails({ action, descriptor }: { action: ActionNode; descriptor: DescriptorNode }) {
  const router = useRouter()
  const [addingObservation, setAddingObservation] = React.useState(false)
  const [observationDraft, setObservationDraft] = React.useState('')
  const [observationPending, setObservationPending] = React.useState(false)
  const [observationError, setObservationError] = React.useState('')
  const [monthPending, setMonthPending] = React.useState(false)
  const [monthError, setMonthError] = React.useState('')
  const [monthOverrides, setMonthOverrides] = React.useState<Record<number, 'done' | 'missed' | null>>({})
  const monthStatuses = new Map<number, 'done' | 'missed'>(action.monthStatuses.map(({ month, status }) => [month, status]))
  for (const [month, status] of Object.entries(monthOverrides)) {
    if (status === null) monthStatuses.delete(Number(month))
    else monthStatuses.set(Number(month), status)
  }
  const plannedCount = plannedMonthCount(action.startMonth, action.endMonth)
  const completedCount = [...monthStatuses].filter(([month, status]) => status === 'done' && month >= (action.startMonth ?? 1) && month <= (action.endMonth ?? 12)).length
  const effectiveStatuses = [...monthStatuses].map(([month, status]) => ({ month, status }))
  const calculatedPercentage = monthlyCompletionPercentage(action.startMonth, action.endMonth, effectiveStatuses)

  React.useEffect(() => {
    setMonthOverrides({})
  }, [action.monthStatuses])

  const cycleMonthStatus = async (month: number, current: 'done' | 'missed' | null) => {
    if (monthPending) return
    const next = current === null ? 'done' : current === 'done' ? 'missed' : null
    setMonthPending(true)
    setMonthError('')
    setMonthOverrides((previous) => ({ ...previous, [month]: next }))
    try {
      await setActionMonthStatus(action.id, month, next)
      router.refresh()
    } catch {
      setMonthOverrides((previous) => ({ ...previous, [month]: current }))
      setMonthError('No se pudo guardar el estado del mes. Intentá de nuevo.')
    } finally {
      setMonthPending(false)
    }
  }

  const saveObservation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = observationDraft.trim()
    if (!text || observationPending) return
    setObservationPending(true)
    setObservationError('')
    try {
      await createObservation({ actionId: action.id, text })
      setObservationDraft('')
      setAddingObservation(false)
      router.refresh()
    } catch {
      setObservationError('No se pudo guardar la observación. Intentá de nuevo.')
    } finally {
      setObservationPending(false)
    }
  }

  return (
    <div id={`report-detail-${action.id}`} className="space-y-5 border-t border-border bg-muted/20 px-4 py-4 sm:px-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <DetailField label="Iniciativa" value={descriptor.initiative} />
        <DetailField label="Indicador de medición" value={descriptor.indicator} />
        <DetailField label="Responsable de evaluación" value={action.evaluationUnitName} />
      </div>
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cumplimiento mensual</h4>
            {plannedCount > 0 && <p className="mt-1 text-xs text-muted-foreground">Pulsá cada mes para alternar entre ✓, X y sin marcar.</p>}
          </div>
          {plannedCount > 0 && <p className="text-xs font-medium text-foreground tabular-nums" aria-live="polite">{completedCount} de {plannedCount} meses cumplidos · {calculatedPercentage}%</p>}
        </div>
        {plannedCount === 0 && <p className="mt-2 text-xs text-muted-foreground">Definí el período de la acción para marcar sus meses.</p>}
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
          {MONTHS.map((month, index) => {
            const number = index + 1
            const planned = plannedCount > 0 && number >= action.startMonth! && number <= action.endMonth!
            const status = planned ? (monthStatuses.get(number) ?? null) : null
            const label = status === 'done' ? 'Cumplido' : status === 'missed' ? 'No cumplido' : planned ? 'Sin marcar' : 'Fuera del período'
            const nextLabel = status === 'done' ? 'No cumplido' : status === 'missed' ? 'Sin marcar' : 'Cumplido'
            return (
              <button key={month} type="button" disabled={!planned || monthPending} aria-label={`${MONTHS_LONG[index]}: ${label}${planned ? `. Pulsar para marcar ${nextLabel}.` : ''}`} onClick={() => cycleMonthStatus(number, status)} className={cn('min-h-16 rounded-lg border px-2 py-2 text-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500', status === 'done' ? 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 cursor-pointer' : status === 'missed' ? 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 cursor-pointer' : planned ? 'border-border bg-card text-foreground hover:border-teal-500 hover:bg-teal-500/5 cursor-pointer' : 'border-border/60 text-muted-foreground opacity-60')}>
                <span className="block font-semibold">{month}</span>
                <span className="mt-1 flex min-h-4 items-center justify-center text-[10px]">{status === 'done' ? <Check size={16} aria-hidden="true" /> : status === 'missed' ? <X size={16} aria-hidden="true" /> : planned ? 'Sin marcar' : '—'}</span>
              </button>
            )
          })}
        </div>
        {monthError && <p role="alert" className="mt-2 text-xs text-destructive">{monthError}</p>}
      </section>
      {action.followUps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Registros de seguimiento</h4>
          <ul className="mt-2 space-y-2">
            {action.followUps.map((followUp) => (
              <li key={followUp.id} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground">
                <span className="font-semibold">{MONTHS_LONG[followUp.month - 1]}</span>
                {followUp.executionComment && <p className="mt-1">{followUp.executionComment}</p>}
                {followUp.evaluationResponse && <p className="mt-1 text-muted-foreground"><span className="font-semibold">Evaluación:</span> {followUp.evaluationResponse}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Observaciones ({action.observations.length})</h4>
          {!addingObservation && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAddingObservation(true); setObservationError('') }} className="text-blue-700 dark:text-teal-400 print:hidden">
              <Plus size={14} />Agregar observación
            </Button>
          )}
        </div>
        {action.observations.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Sin observaciones registradas.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {action.observations.map((observation) => (
              <li key={observation.id} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground text-pretty">{observation.text}</li>
            ))}
          </ul>
        )}
        {addingObservation && (
          <form onSubmit={saveObservation} className="mt-3 space-y-2 print:hidden">
            <Textarea label="Nueva observación" value={observationDraft} onChange={(event) => setObservationDraft(event.target.value)} placeholder="Escribí una observación sobre esta acción…" rows={2} required disabled={observationPending} />
            {observationError && <p role="alert" className="text-xs text-destructive">{observationError}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={observationPending || !observationDraft.trim()}>{observationPending ? 'Guardando…' : 'Guardar observación'}</Button>
              <Button type="button" variant="ghost" size="sm" disabled={observationPending} onClick={() => { setAddingObservation(false); setObservationDraft(''); setObservationError('') }}>Cancelar</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h4>
      <p className="mt-1 text-sm text-foreground text-pretty">{value || 'Sin registrar'}</p>
    </div>
  )
}
