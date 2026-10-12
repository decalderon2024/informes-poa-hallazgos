'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Target,
  ListChecks,
  Lightbulb,
  Gauge,
  FolderTree,
  Building2,
  ClipboardList,
} from 'lucide-react'
import type {
  CategoryNode,
  ObjectiveNode,
  DescriptorNode,
  ActionNode,
  Unit,
} from '@/lib/types'
import {
  CATEGORY_COLORS,
  type CategoryColor,
  MONTHS,
  MONTHS_LONG,
  progressTone,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Card, CardBody } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'
import { Modal } from '@/components/modal'
import { EmptyState } from '@/components/empty-state'
import { ActionDetail } from '@/components/structure/action-detail'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createObjective,
  updateObjective,
  deleteObjective,
  createDescriptor,
  updateDescriptor,
  deleteDescriptor,
  createAction,
  updateAction,
  deleteAction,
} from '@/app/actions'

type ModalState =
  | { kind: 'category'; mode: 'create' | 'edit'; node?: CategoryNode }
  | {
      kind: 'objective'
      mode: 'create' | 'edit'
      categoryId: number
      node?: ObjectiveNode
    }
  | {
      kind: 'descriptor'
      mode: 'create' | 'edit'
      objectiveId: number
      node?: DescriptorNode
    }
  | {
      kind: 'action'
      mode: 'create' | 'edit'
      descriptorId: number
      node?: ActionNode
    }
  | null

const COLOR_KEYS = Object.keys(CATEGORY_COLORS) as CategoryColor[]

export function StructureView({
  tree,
  units,
  planId,
}: {
  tree: CategoryNode[]
  units: Unit[]
  planId: number
}) {
  const [modal, setModal] = React.useState<ModalState>(null)
  const [detail, setDetail] = React.useState<ActionNode | null>(null)
  const [openCats, setOpenCats] = React.useState<Set<number>>(
    () => new Set(tree.map((c) => c.id)),
  )
  const [openObjs, setOpenObjs] = React.useState<Set<number>>(() => new Set())

  // Keep the detail modal in sync with refreshed tree data.
  React.useEffect(() => {
    if (!detail) return
    for (const c of tree)
      for (const o of c.objectives)
        for (const d of o.descriptors)
          for (const a of d.actions)
            if (a.id === detail.id) {
              setDetail(a)
              return
            }
  }, [tree]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (set: Set<number>, setter: (s: Set<number>) => void, id: number) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  if (tree.length === 0) {
    return (
      <>
        <EmptyState
          icon={<FolderTree size={26} />}
          title="Este plan aún no tiene categorías"
          description="Registra la primera clasificación (Económico, Legal, Crecimiento, Auditoría, Sustentabilidad…) para comenzar a estructurar el POA."
          action={
            <Button onClick={() => setModal({ kind: 'category', mode: 'create' })}>
              <Plus size={16} />
              Nueva categoría
            </Button>
          }
        />
        <FormModal
          modal={modal}
          setModal={setModal}
          units={units}
          planId={planId}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModal({ kind: 'category', mode: 'create' })}>
          <Plus size={16} />
          Nueva categoría
        </Button>
      </div>

      {tree.map((cat) => {
        const color = CATEGORY_COLORS[cat.color as CategoryColor] ?? CATEGORY_COLORS.blue
        const isOpen = openCats.has(cat.id)
        return (
          <Card key={cat.id} className="overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
              <button
                type="button"
                onClick={() => toggle(openCats, setOpenCats, cat.id)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Contraer categoría' : 'Expandir categoría'}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <ChevronRight
                  size={18}
                  className={cn('transition-transform', isOpen && 'rotate-90')}
                />
              </button>
              <span className={cn('h-8 w-1.5 shrink-0 rounded-full', color.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-bold text-foreground">
                    {cat.name}
                  </h2>
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', color.soft, color.text)}>
                    {cat.objectives.length} obj.
                  </span>
                </div>
                {cat.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                )}
              </div>
              <RowActions
                onEdit={() => setModal({ kind: 'category', mode: 'edit', node: cat })}
                onDelete={() => {
                  if (
                    confirm(
                      `¿Eliminar la categoría "${cat.name}" y todo su contenido?`,
                    )
                  )
                    deleteCategory(cat.id)
                }}
              />
            </div>

            {isOpen && (
              <div className="border-t border-border bg-muted/20 px-3 py-3 sm:px-4">
                <div className="space-y-3">
                  {cat.objectives.map((obj) => {
                    const objOpen = openObjs.has(obj.id)
                    return (
                      <div key={obj.id} className="rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => toggle(openObjs, setOpenObjs, obj.id)}
                            aria-expanded={objOpen}
                            aria-label={objOpen ? 'Contraer objetivo' : 'Expandir objetivo'}
                            className="rounded-md p-0.5 text-muted-foreground hover:bg-muted"
                          >
                            <ChevronRight
                              size={16}
                              className={cn('transition-transform', objOpen && 'rotate-90')}
                            />
                          </button>
                          <Target size={15} className="shrink-0 text-blue-700 dark:text-teal-400" />
                          <p className="min-w-0 flex-1 text-sm font-semibold text-foreground text-pretty">
                            {obj.text}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {obj.descriptors.length} desc.
                          </span>
                          <RowActions
                            small
                            onEdit={() =>
                              setModal({
                                kind: 'objective',
                                mode: 'edit',
                                categoryId: cat.id,
                                node: obj,
                              })
                            }
                            onDelete={() => {
                              if (confirm('¿Eliminar este objetivo y su contenido?'))
                                deleteObjective(obj.id)
                            }}
                          />
                        </div>

                        {objOpen && (
                          <div className="space-y-3 border-t border-border px-3 py-3">
                            {obj.descriptors.map((desc) => (
                              <DescriptorBlock
                                key={desc.id}
                                desc={desc}
                                onEdit={() =>
                                  setModal({
                                    kind: 'descriptor',
                                    mode: 'edit',
                                    objectiveId: obj.id,
                                    node: desc,
                                  })
                                }
                                onDelete={() => {
                                  if (
                                    confirm('¿Eliminar este descriptor y sus acciones?')
                                  )
                                    deleteDescriptor(desc.id)
                                }}
                                onAddAction={() =>
                                  setModal({
                                    kind: 'action',
                                    mode: 'create',
                                    descriptorId: desc.id,
                                  })
                                }
                                onEditAction={(a) =>
                                  setModal({
                                    kind: 'action',
                                    mode: 'edit',
                                    descriptorId: desc.id,
                                    node: a,
                                  })
                                }
                                onOpenAction={(a) => setDetail(a)}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => setModal({ kind: 'descriptor', mode: 'create', objectiveId: obj.id })}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline dark:text-teal-400"
                            >
                              <Plus size={14} />
                              Nuevo descriptor
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: 'objective',
                        mode: 'create',
                        categoryId: cat.id,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline dark:text-teal-400"
                  >
                    <Plus size={15} />
                    Agregar objetivo
                  </button>
                </div>
              </div>
            )}
          </Card>
        )
      })}

      <FormModal modal={modal} setModal={setModal} units={units} planId={planId} />
      <ActionDetail
        action={detail}
        open={detail !== null}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}

export function ObjectiveDetailView({
  category,
  objective,
  units,
  planId,
}: {
  category: CategoryNode
  objective: ObjectiveNode
  units: Unit[]
  planId: number
}) {
  const [modal, setModal] = React.useState<ModalState>(null)
  const [detail, setDetail] = React.useState<ActionNode | null>(null)
  const [addingDescriptor, setAddingDescriptor] = React.useState(false)
  const [descriptorForm, setDescriptorForm] = React.useState({ text: '', initiative: '', indicator: '' })
  const [descriptorError, setDescriptorError] = React.useState('')
  const [descriptorPending, startDescriptorTransition] = React.useTransition()

  const saveDescriptor = () => {
    if (descriptorPending) return
    if (!descriptorForm.text.trim()) {
      setDescriptorError('Escribí la descripción antes de guardar.')
      return
    }
    setDescriptorError('')
    startDescriptorTransition(async () => {
      try {
        await createDescriptor({
          objectiveId: objective.id,
          text: descriptorForm.text.trim(),
          initiative: descriptorForm.initiative.trim(),
          indicator: descriptorForm.indicator.trim(),
        })
        setDescriptorForm({ text: '', initiative: '', indicator: '' })
        setAddingDescriptor(false)
      } catch {
        setDescriptorError('No se pudo guardar el descriptor. Intentá de nuevo.')
      }
    })
  }

  React.useEffect(() => {
    if (!detail) return
    for (const d of objective.descriptors)
      for (const a of d.actions)
        if (a.id === detail.id) {
          setDetail(a)
          return
        }
  }, [objective]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <Link
        href={`/estructura/categoria/${category.id}?plan=${planId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Volver a objetivos
      </Link>

      <Card>
        <CardBody>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Objetivo
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground text-pretty">
            {objective.text}
          </h2>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-foreground">Descriptores y acciones</h3>
          <p className="text-sm text-muted-foreground">
            Agregá descriptores y acciones sin salir de esta pantalla.
          </p>
        </div>
        <Button size="sm" onClick={() => setAddingDescriptor(true)} disabled={addingDescriptor}>
          <Plus size={15} />
          Nuevo descriptor
        </Button>
      </div>

      {addingDescriptor && (
        <section className="rounded-xl border border-teal-500/50 bg-card p-4 shadow-sm" aria-label="Nuevo descriptor">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-foreground">Nuevo descriptor</h4>
              <p className="text-xs text-muted-foreground">Primero guardá el descriptor; luego agregá sus acciones aquí mismo.</p>
            </div>
            <button type="button" onClick={() => setAddingDescriptor(false)} className="text-sm text-muted-foreground hover:text-foreground" disabled={descriptorPending}>Cancelar</button>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <Textarea label="Descripción" rows={2} required autoFocus value={descriptorForm.text} onChange={(e) => { setDescriptorForm((form) => ({ ...form, text: e.target.value })); setDescriptorError('') }} />
            <Textarea label="Iniciativa" rows={2} value={descriptorForm.initiative} onChange={(e) => setDescriptorForm((form) => ({ ...form, initiative: e.target.value }))} />
            <Textarea label="Indicador" rows={2} value={descriptorForm.indicator} onChange={(e) => setDescriptorForm((form) => ({ ...form, indicator: e.target.value }))} />
          </div>
          {descriptorError && <p role="alert" className="mt-2 text-sm text-destructive">{descriptorError}</p>}
          <div className="mt-3 flex justify-end"><Button size="sm" onClick={saveDescriptor} disabled={descriptorPending}>{descriptorPending ? 'Guardando…' : 'Guardar descriptor'}</Button></div>
        </section>
      )}

      {objective.descriptors.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={24} />}
          title="No hay descriptores"
          description="Agrega el primer descriptor de este objetivo para comenzar a registrar acciones."
          action={
            <Button onClick={() => setAddingDescriptor(true)} disabled={addingDescriptor}>
              <Plus size={15} />
              Nuevo descriptor
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {objective.descriptors.map((desc) => (
            <DescriptorWorkspaceCard
              key={desc.id}
              desc={desc}
              units={units}
              onEdit={() =>
                setModal({ kind: 'descriptor', mode: 'edit', objectiveId: objective.id, node: desc })
              }
              onDelete={() => {
                if (confirm('¿Eliminar este descriptor y sus acciones?')) deleteDescriptor(desc.id)
              }}
              onEditAction={(a) =>
                setModal({ kind: 'action', mode: 'edit', descriptorId: desc.id, node: a })
              }
              onOpenAction={(a) => setDetail(a)}
            />
          ))}
        </div>
      )}

      <FormModal modal={modal} setModal={setModal} units={units} planId={planId} />
      <ActionDetail action={detail} open={detail !== null} onClose={() => setDetail(null)} />
    </div>
  )
}

function DescriptorWorkspaceCard({
  desc,
  units,
  onEdit,
  onDelete,
  onEditAction,
  onOpenAction,
}: {
  desc: DescriptorNode
  units: Unit[]
  onEdit: () => void
  onDelete: () => void
  onEditAction: (action: ActionNode) => void
  onOpenAction: (action: ActionNode) => void
}) {
  const lastAction = desc.actions.at(-1)
  const [addingAction, setAddingAction] = React.useState(false)
  const [description, setDescription] = React.useState('')
  const [executionUnitId, setExecutionUnitId] = React.useState(String(lastAction?.executionUnitId ?? ''))
  const [evaluationUnitId, setEvaluationUnitId] = React.useState(String(lastAction?.evaluationUnitId ?? ''))
  const [startMonth, setStartMonth] = React.useState(String(lastAction?.startMonth ?? 1))
  const [endMonth, setEndMonth] = React.useState(String(lastAction?.endMonth ?? 12))
  const [error, setError] = React.useState('')
  const [pending, startTransition] = React.useTransition()
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null)

  const saveAction = (event: React.FormEvent) => {
    event.preventDefault()
    if (pending) return
    if (!description.trim()) {
      setError('Escribí la acción antes de guardarla.')
      descriptionRef.current?.focus()
      return
    }
    if (Number(startMonth) > Number(endMonth)) {
      setError('El mes final debe ser igual o posterior al mes inicial.')
      return
    }
    setError('')
    startTransition(async () => {
      try {
        await createAction({
          descriptorId: desc.id,
          description: description.trim(),
          executionUnitId: executionUnitId ? Number(executionUnitId) : null,
          evaluationUnitId: evaluationUnitId ? Number(evaluationUnitId) : null,
          startMonth: Number(startMonth),
          endMonth: Number(endMonth),
        })
        setDescription('')
        descriptionRef.current?.focus()
      } catch {
        setError('No se pudo guardar la acción. Intentá de nuevo.')
      }
    })
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-label={`Descriptor: ${desc.text}`}>
      <div className="flex items-start gap-3 border-b border-border bg-muted/30 px-4 py-4 sm:px-5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400"><ClipboardList size={17} /></span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground text-pretty">{desc.text}</h4>
          <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
            {desc.initiative && <p><span className="font-semibold text-foreground">Iniciativa:</span> {desc.initiative}</p>}
            {desc.indicator && <p><span className="font-semibold text-foreground">Indicador:</span> {desc.indicator}</p>}
          </div>
        </div>
        <RowActions small onEdit={onEdit} onDelete={onDelete} />
      </div>

      <p className="px-4 pt-2 text-xs text-muted-foreground sm:hidden">Deslizá la tabla para ver todas las columnas.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="w-[38%] px-4 py-2 font-semibold sm:px-5">Acción</th>
              <th scope="col" className="px-3 py-2 font-semibold">Responsable</th>
              <th scope="col" className="px-3 py-2 font-semibold">Meses</th>
              <th scope="col" className="px-3 py-2 font-semibold">Avance</th>
              <th scope="col" className="px-3 py-2 font-semibold">Seguimientos</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">Opciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {desc.actions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-5 text-sm text-muted-foreground sm:px-5">Todavía no hay acciones. Agregá la primera debajo.</td></tr>
            )}
            {desc.actions.map((action) => {
              const tone = progressTone(action.completionPercentage)
              return (
                <tr key={action.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 sm:px-5">
                    <button type="button" onClick={() => onOpenAction(action)} className="text-left font-medium text-foreground hover:text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-teal-400">{action.description}</button>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{action.executionUnitName ?? 'Sin asignar'}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{action.startMonth && action.endMonth ? `${MONTHS[action.startMonth - 1]}–${MONTHS[action.endMonth - 1]}` : '—'}</td>
                  <td className="whitespace-nowrap px-3 py-3"><Badge variant={tone.badge}>{action.completionPercentage}%</Badge></td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{action.followUps.length}</td>
                  <td className="px-3 py-3"><div className="flex justify-end"><RowActions small onEdit={() => onEditAction(action)} onDelete={() => { if (confirm('¿Eliminar esta acción y sus seguimientos?')) deleteAction(action.id) }} /></div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-5">
        {!addingAction ? (
          <button type="button" onClick={() => setAddingAction(true)} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"><Plus size={16} />Agregar acción</button>
        ) : (
          <form onSubmit={saveAction} className="space-y-3" aria-label={`Nueva acción para ${desc.text}`}>
            <div className="flex items-center justify-between gap-3"><h5 className="text-sm font-semibold text-foreground">Nueva acción</h5><button type="button" onClick={() => setAddingAction(false)} disabled={pending} className="text-sm text-muted-foreground hover:text-foreground">Cerrar</button></div>
            <Textarea ref={descriptionRef} label="Acción" rows={2} required autoFocus value={description} onChange={(event) => { setDescription(event.target.value); setError('') }} placeholder="¿Qué se va a realizar?" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="Responsable" value={executionUnitId} onChange={(event) => setExecutionUnitId(event.target.value)}><option value="">Sin asignar</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</Select>
              <Select label="Evaluación" value={evaluationUnitId} onChange={(event) => setEvaluationUnitId(event.target.value)}><option value="">Sin asignar</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</Select>
              <Select label="Mes inicial" value={startMonth} onChange={(event) => { setStartMonth(event.target.value); setError('') }}>{MONTHS_LONG.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</Select>
              <Select label="Mes final" value={endMonth} onChange={(event) => { setEndMonth(event.target.value); setError('') }}>{MONTHS_LONG.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</Select>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">Después de guardar, podés escribir la siguiente acción sin cerrar este formulario.</p><Button size="sm" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar acción'}</Button></div>
          </form>
        )}
      </div>
    </section>
  )
}

function DescriptorBlock({
  desc,
  onEdit,
  onDelete,
  onAddAction,
  onEditAction,
  onOpenAction,
  variant = 'nested',
}: {
  desc: DescriptorNode
  onEdit: () => void
  onDelete: () => void
  onAddAction: () => void
  onEditAction: (a: ActionNode) => void
  onOpenAction: (a: ActionNode) => void
  variant?: 'nested' | 'card'
}) {
  return (
    <div
      className={cn(
        variant === 'nested' && 'rounded-lg border border-border bg-muted/30 p-3',
        variant === 'card' && 'rounded-xl border border-border bg-card p-4 shadow-sm',
      )}
    >
      <div className="flex items-start gap-2">
        <ClipboardList size={15} className="mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground text-pretty">
            {desc.text}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {desc.initiative && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Lightbulb size={12} className="text-amber-500" />
                <span className="font-medium text-foreground">Iniciativa:</span>{' '}
                {desc.initiative}
              </span>
            )}
            {desc.indicator && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Gauge size={12} className="text-teal-500" />
                <span className="font-medium text-foreground">Indicador:</span>{' '}
                {desc.indicator}
              </span>
            )}
          </div>
        </div>
        <RowActions small onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        {desc.actions.map((a) => {
          const tone = progressTone(a.completionPercentage)
          return (
            <div
              key={a.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5 sm:flex-row sm:items-center"
            >
              <button
                type="button"
                onClick={() => onOpenAction(a)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-foreground">
                  {a.description}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={11} />
                    {a.executionUnitName ?? 'Sin ejecutor'}
                  </span>
                  {a.startMonth && a.endMonth && (
                    <span>
                      {MONTHS[a.startMonth - 1]}–{MONTHS[a.endMonth - 1]}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <ListChecks size={11} />
                    {a.followUps.length} seg.
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-2 sm:w-52 sm:shrink-0">
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <Badge variant={tone.badge}>{tone.label}</Badge>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {a.completionPercentage}%
                    </span>
                  </div>
                  <MiniBar value={a.completionPercentage} />
                </div>
                <RowActions
                  small
                  onEdit={() => onEditAction(a)}
                  onDelete={() => {
                    if (confirm('¿Eliminar esta acción y sus seguimientos?'))
                      deleteAction(a.id)
                  }}
                />
              </div>
            </div>
          )
        })}
        <button
          type="button"
          onClick={onAddAction}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline dark:text-teal-400"
        >
          <Plus size={13} />
          Agregar acción
        </button>
      </div>
    </div>
  )
}

function MiniBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function RowActions({
  onEdit,
  onDelete,
  small,
}: {
  onEdit: () => void
  onDelete: () => void
  small?: boolean
}) {
  const size = small ? 14 : 16
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil size={size} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
      >
        <Trash2 size={size} />
      </button>
    </div>
  )
}

/* ------------------------------ Form modal ------------------------------ */

function FormModal({
  modal,
  setModal,
  units,
  planId,
}: {
  modal: ModalState
  setModal: (m: ModalState) => void
  units: Unit[]
  planId: number
}) {
  const [pending, startTransition] = React.useTransition()
  const [form, setForm] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!modal) return
    if (modal.kind === 'category') {
      setForm({
        name: modal.node?.name ?? '',
        description: modal.node?.description ?? '',
        color: modal.node?.color ?? 'blue',
      })
    } else if (modal.kind === 'objective') {
      setForm({ text: modal.node?.text ?? '' })
    } else if (modal.kind === 'descriptor') {
      setForm({
        text: modal.node?.text ?? '',
        initiative: modal.node?.initiative ?? '',
        indicator: modal.node?.indicator ?? '',
      })
    } else if (modal.kind === 'action') {
      setForm({
        description: modal.node?.description ?? '',
        executionUnitId: modal.node?.executionUnitId
          ? String(modal.node.executionUnitId)
          : '',
        evaluationUnitId: modal.node?.evaluationUnitId
          ? String(modal.node.evaluationUnitId)
          : '',
        startMonth: modal.node?.startMonth ? String(modal.node.startMonth) : '1',
        endMonth: modal.node?.endMonth ? String(modal.node.endMonth) : '12',
      })
    }
  }, [modal])

  if (!modal) return null

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const close = () => setModal(null)

  const titles: Record<string, string> = {
    category: modal.mode === 'create' ? 'Nueva categoría' : 'Editar categoría',
    objective: modal.mode === 'create' ? 'Nuevo objetivo' : 'Editar objetivo',
    descriptor: modal.mode === 'create' ? 'Nuevo descriptor' : 'Editar descriptor',
    action: modal.mode === 'create' ? 'Nueva acción' : 'Editar acción',
  }

  const submit = () =>
    startTransition(async () => {
      if (modal.kind === 'category') {
        if (!form.name?.trim()) return
        const data = {
          name: form.name.trim(),
          description: form.description?.trim(),
          color: form.color,
        }
        if (modal.mode === 'create')
          await createCategory({ planId, ...data })
        else await updateCategory(modal.node!.id, data)
      } else if (modal.kind === 'objective') {
        if (!form.text?.trim()) return
        if (modal.mode === 'create')
          await createObjective({ categoryId: modal.categoryId, text: form.text.trim() })
        else await updateObjective(modal.node!.id, form.text.trim())
      } else if (modal.kind === 'descriptor') {
        if (!form.text?.trim()) return
        const data = {
          text: form.text.trim(),
          initiative: form.initiative?.trim(),
          indicator: form.indicator?.trim(),
        }
        if (modal.mode === 'create')
          await createDescriptor({ objectiveId: modal.objectiveId, ...data })
        else await updateDescriptor(modal.node!.id, data)
      } else if (modal.kind === 'action') {
        if (!form.description?.trim()) return
        const data = {
          description: form.description.trim(),
          executionUnitId: form.executionUnitId ? Number(form.executionUnitId) : null,
          evaluationUnitId: form.evaluationUnitId ? Number(form.evaluationUnitId) : null,
          startMonth: form.startMonth ? Number(form.startMonth) : null,
          endMonth: form.endMonth ? Number(form.endMonth) : null,
        }
        if (modal.mode === 'create')
          await createAction({ descriptorId: modal.descriptorId, ...data })
        else await updateAction(modal.node!.id, data)
      }
      close()
    })

  return (
    <Modal
      open
      onClose={close}
      title={titles[modal.kind]}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            {modal.mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {modal.kind === 'category' && (
          <>
            <Input
              label="Nombre de la categoría"
              placeholder="Ej. Económico, Legal, Crecimiento…"
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
              required
            />
            <Textarea
              label="Descripción (opcional)"
              placeholder="Breve descripción de la clasificación"
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
            />
            <div>
              <span className="mb-1.5 block text-sm font-medium text-foreground">
                Color distintivo
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_KEYS.map((k) => {
                  const c = CATEGORY_COLORS[k]
                  const selected = form.color === k
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set('color', k)}
                      aria-label={c.label}
                      aria-pressed={selected}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'border-teal-500 bg-teal-500/10 text-foreground'
                          : 'border-border text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <span className={cn('h-3 w-3 rounded-full', c.dot)} />
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {modal.kind === 'objective' && (
          <Textarea
            label="Objetivo"
            placeholder="Redacta el objetivo del plan"
            value={form.text ?? ''}
            onChange={(e) => set('text', e.target.value)}
            rows={3}
            required
          />
        )}

        {modal.kind === 'descriptor' && (
          <>
            <Textarea
              label="Descriptor"
              placeholder="Ítem o descripción del objetivo"
              value={form.text ?? ''}
              onChange={(e) => set('text', e.target.value)}
              required
            />
            <Textarea
              label="Iniciativa"
              placeholder="Iniciativa asociada"
              value={form.initiative ?? ''}
              onChange={(e) => set('initiative', e.target.value)}
              rows={2}
            />
            <Textarea
              label="Indicador"
              placeholder="Indicador de medición"
              value={form.indicator ?? ''}
              onChange={(e) => set('indicator', e.target.value)}
              rows={2}
            />
          </>
        )}

        {modal.kind === 'action' && (
          <>
            <Textarea
              label="Descripción de la acción"
              placeholder="¿Qué se va a realizar?"
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Responsable de ejecución"
                value={form.executionUnitId ?? ''}
                onChange={(e) => set('executionUnitId', e.target.value)}
              >
                <option value="">Sin asignar</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Responsable de evaluación"
                value={form.evaluationUnitId ?? ''}
                onChange={(e) => set('evaluationUnitId', e.target.value)}
              >
                <option value="">Sin asignar</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Mes inicial"
                value={form.startMonth ?? '1'}
                onChange={(e) => set('startMonth', e.target.value)}
              >
                {MONTHS_LONG.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </Select>
              <Select
                label="Mes final"
                value={form.endMonth ?? '12'}
                onChange={(e) => set('endMonth', e.target.value)}
              >
                {MONTHS_LONG.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
