'use client'

import * as React from 'react'
import {
  MessageSquarePlus,
  StickyNote,
  Trash2,
  CornerDownRight,
  Gauge,
} from 'lucide-react'
import type { ActionNode } from '@/lib/types'
import { MONTHS_LONG, progressTone } from '@/lib/constants'
import { Modal } from '@/components/modal'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'
import { ProgressBar } from '@/components/progress-bar'
import { plannedMonthCount } from '@/lib/stats'
import {
  createFollowUp,
  respondFollowUp,
  deleteFollowUp,
  createObservation,
  deleteObservation,
} from '@/app/actions'

export function ActionDetail({
  action,
  open,
  onClose,
}: {
  action: ActionNode | null
  open: boolean
  onClose: () => void
}) {
  const [pending, startTransition] = React.useTransition()
  const [newMonth, setNewMonth] = React.useState('1')
  const [newComment, setNewComment] = React.useState('')
  const [newObs, setNewObs] = React.useState('')
  const [respondingId, setRespondingId] = React.useState<number | null>(null)
  const [responseText, setResponseText] = React.useState('')

  React.useEffect(() => {
    if (action) {
      setNewMonth(String(action.startMonth ?? 1))
      setNewComment('')
      setNewObs('')
      setRespondingId(null)
      setResponseText('')
    }
  }, [action])

  if (!action) return null

  const tone = progressTone(action.completionPercentage)
  const plannedCount = plannedMonthCount(action.startMonth, action.endMonth)
  const completedCount = action.monthStatuses.filter(({ month, status }) => status === 'done' && month >= (action.startMonth ?? 1) && month <= (action.endMonth ?? 12)).length

  const addFollowUp = () => {
    if (!newComment.trim()) return
    startTransition(async () => {
      await createFollowUp({
        actionId: action.id,
        month: Number(newMonth),
        executionComment: newComment.trim(),
      })
      setNewComment('')
    })
  }

  const sendResponse = (id: number) => {
    startTransition(async () => {
      await respondFollowUp(id, responseText.trim())
      setRespondingId(null)
      setResponseText('')
    })
  }

  const removeFollowUp = (id: number) => {
    if (!confirm('¿Eliminar este seguimiento?')) return
    startTransition(async () => {
      await deleteFollowUp(id)
    })
  }

  const addObservation = () => {
    if (!newObs.trim()) return
    startTransition(async () => {
      await createObservation({ actionId: action.id, text: newObs.trim() })
      setNewObs('')
    })
  }

  const removeObservation = (id: number) => {
    if (!confirm('¿Eliminar esta observación?')) return
    startTransition(async () => {
      await deleteObservation(id)
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Detalle de la acción"
      description={action.description}
    >
      <div className="space-y-6">
        {/* Responsibles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile
            label="Responsable de ejecución"
            value={action.executionUnitName ?? 'Sin asignar'}
          />
          <InfoTile
            label="Responsable de evaluación"
            value={action.evaluationUnitName ?? 'Sin asignar'}
          />
          <InfoTile
            label="Eje de ejecución"
            value={
              action.startMonth && action.endMonth
                ? `${MONTHS_LONG[action.startMonth - 1]} – ${MONTHS_LONG[action.endMonth - 1]}`
                : 'Sin definir'
            }
          />
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Estado
            </p>
            <Badge variant={tone.badge}>{tone.label}</Badge>
          </div>
        </div>

        {/* Calculated progress */}
        <section className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Gauge size={18} className="text-blue-700 dark:text-teal-400" />
            <h3 className="text-sm font-semibold text-foreground">
              Porcentaje de cumplimiento
            </h3>
          </div>
          <p className="text-sm text-foreground tabular-nums">{plannedCount > 0 ? `${completedCount} de ${plannedCount} meses cumplidos` : 'Sin período planificado'} · {action.completionPercentage}%</p>
          <div className="mt-3">
            <ProgressBar value={action.completionPercentage} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Se calcula con los meses marcados como cumplidos en el reporte.</p>
        </section>

        {/* Follow-ups */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <MessageSquarePlus size={18} className="text-blue-700 dark:text-teal-400" />
            <h3 className="text-sm font-semibold text-foreground">
              Seguimientos ({action.followUps.length})
            </h3>
          </div>

          <div className="space-y-3">
            {action.followUps.length === 0 && (
              <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                Aún no hay seguimientos registrados.
              </p>
            )}
            {action.followUps.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="info">{MONTHS_LONG[f.month - 1]}</Badge>
                  <button
                    type="button"
                    onClick={() => removeFollowUp(f.id)}
                    aria-label="Eliminar seguimiento"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {f.executionComment && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Ejecución
                    </p>
                    <p className="mt-0.5 text-sm text-foreground text-pretty">
                      {f.executionComment}
                    </p>
                  </div>
                )}
                {f.evaluationResponse ? (
                  <div className="mt-2 rounded-md bg-muted/60 p-2.5">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <CornerDownRight size={12} />
                      Evaluación
                    </p>
                    <p className="mt-0.5 text-sm text-foreground text-pretty">
                      {f.evaluationResponse}
                    </p>
                  </div>
                ) : respondingId === f.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Respuesta del responsable de evaluación…"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRespondingId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => sendResponse(f.id)}
                        disabled={pending || !responseText.trim()}
                      >
                        Responder
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRespondingId(f.id)
                      setResponseText('')
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-teal-400"
                  >
                    <CornerDownRight size={13} />
                    Responder evaluación
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* New follow-up */}
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-semibold text-foreground">
              Nuevo seguimiento
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="sm:w-40">
                <Select
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  aria-label="Mes del seguimiento"
                >
                  {MONTHS_LONG.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="¿Qué se hizo o cuál es el estado actual?"
                rows={2}
                className="min-h-[44px]"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                onClick={addFollowUp}
                disabled={pending || !newComment.trim()}
              >
                Agregar seguimiento
              </Button>
            </div>
          </div>
        </section>

        {/* Observations */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <StickyNote size={18} className="text-blue-700 dark:text-teal-400" />
            <h3 className="text-sm font-semibold text-foreground">
              Observaciones ({action.observations.length})
            </h3>
          </div>
          <div className="space-y-2">
            {action.observations.length === 0 && (
              <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                Sin observaciones.
              </p>
            )}
            {action.observations.map((o) => (
              <div
                key={o.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <p className="text-sm text-foreground text-pretty">{o.text}</p>
                <button
                  type="button"
                  onClick={() => removeObservation(o.id)}
                  aria-label="Eliminar observación"
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Textarea
              value={newObs}
              onChange={(e) => setNewObs(e.target.value)}
              placeholder="Anotación u observación sobre la acción…"
              rows={2}
            />
            <Button
              size="sm"
              onClick={addObservation}
              disabled={pending || !newObs.trim()}
              className="shrink-0"
            >
              Agregar
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground text-pretty">{value}</p>
    </div>
  )
}
