'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { createFindingObservation, setFindingMonthUpdate } from '@/app/hallazgos/actions'
import { FINDING_STATUSES, findingStats, type Finding, type FindingStatus } from '@/lib/findings'
import { MONTHS, MONTHS_LONG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'

export function FindingReportView({ findings, reportId }: { findings: Finding[]; reportId: number }) {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [areaFilter, setAreaFilter] = React.useState('all')
  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set())
  const stats = findingStats(findings)
  const areas = Array.from(new Set(findings.map((finding) => finding.assignedArea).filter((area): area is string => !!area))).sort((a, b) => a.localeCompare(b, 'es'))
  const query = search.trim().toLocaleLowerCase('es-GT')
  const visible = findings.filter((finding) => {
    if (statusFilter !== 'all' && finding.status !== statusFilter) return false
    if (areaFilter !== 'all' && finding.assignedArea !== areaFilter) return false
    if (!query) return true
    return [finding.reference, finding.title, finding.description, finding.agencyArea, finding.assignedArea, finding.origin, finding.regulatoryBasis]
      .some((value) => value?.toLocaleLowerCase('es-GT').includes(query))
  })
  const toggle = (id: number) => setExpanded((previous) => {
    const next = new Set(previous)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Total de hallazgos" value={stats.total} />
        <Summary label="Corregidos" value={stats.corrected} tone="success" />
        <Summary label="En observación" value={stats.observed} tone="warning" />
        <Summary label="Pendientes" value={stats.pending} tone="error" />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(2,minmax(170px,1fr))_auto] xl:items-end">
          <Input label="Buscar" icon={<Search size={16} />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="N.º, título, área o descripción" />
          <Select label="Estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos los estados</option>{Object.entries(FINDING_STATUSES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select>
          <Select label="Área asignada" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}><option value="all">Todas las áreas</option>{areas.map((area) => <option key={area} value={area}>{area}</option>)}</Select>
          <Link href={`/hallazgos/estructura?informe=${reportId}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-blue-700 hover:bg-muted dark:text-teal-400">Administrar hallazgos</Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground" role="status">Mostrando {visible.length} de {findings.length} hallazgos</p>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center"><p className="font-semibold text-foreground">No se encontraron hallazgos</p><p className="mt-1 text-sm text-muted-foreground">Probá con otros filtros o registrá un hallazgo desde Estructura.</p></div>
      ) : (
        <div className="space-y-3">
          {visible.map((finding, index) => {
            const open = expanded.has(finding.id)
            return (
              <article key={finding.id} className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', open ? 'border-teal-500/50' : 'border-border')}>
                <button type="button" onClick={() => toggle(finding.id)} aria-expanded={open} aria-controls={`finding-detail-${finding.id}`} className={cn('flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-sidebar-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 sm:px-5', open && 'bg-sidebar-accent/30')}>
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">{index + 1}</span>
                    <span className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{finding.reference} · {finding.agencyArea || 'Sin área'}</span><span className="mt-1 block text-sm font-semibold text-foreground text-pretty">{finding.title}</span><span className="mt-1 block text-xs text-muted-foreground">{finding.assignedArea || 'Sin responsable asignado'}</span></span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3"><Badge variant={FINDING_STATUSES[finding.status].badge}>{FINDING_STATUSES[finding.status].label}</Badge><ChevronDown size={16} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" /></span>
                </button>
                {open && <FindingDetail finding={finding} />}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Summary({ label, value, tone = 'info' }: { label: string; value: number; tone?: 'info' | 'success' | 'warning' | 'error' }) {
  const color = { info: 'text-blue-700 dark:text-teal-400', success: 'text-green-700 dark:text-green-300', warning: 'text-amber-700 dark:text-amber-300', error: 'text-red-700 dark:text-red-300' }[tone]
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className={cn('mt-2 text-2xl font-bold tabular-nums', color)}>{value}</p></div>
}

function FindingDetail({ finding }: { finding: Finding }) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null)
  const [draftStatus, setDraftStatus] = React.useState<FindingStatus | null>(null)
  const [draftNote, setDraftNote] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState('')
  const [observationOpen, setObservationOpen] = React.useState(false)
  const [observationText, setObservationText] = React.useState('')
  const [observationPending, setObservationPending] = React.useState(false)
  const [observationError, setObservationError] = React.useState('')
  const byMonth = new Map(finding.monthUpdates.map((update) => [update.month, update]))

  const chooseMonth = (month: number) => {
    const update = byMonth.get(month)
    setSelectedMonth(month)
    setDraftStatus(update?.status ?? null)
    setDraftNote(update?.note ?? '')
    setError('')
  }

  const saveMonth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedMonth === null || pending) return
    setPending(true)
    setError('')
    try {
      await setFindingMonthUpdate(finding.id, selectedMonth, draftStatus, draftNote)
      setSelectedMonth(null)
      router.refresh()
    } catch {
      setError('No se pudo guardar el seguimiento del mes. Intentá de nuevo.')
    } finally {
      setPending(false)
    }
  }

  const saveObservation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!observationText.trim() || observationPending) return
    setObservationPending(true)
    setObservationError('')
    try {
      await createFindingObservation(finding.id, observationText)
      setObservationText('')
      setObservationOpen(false)
      router.refresh()
    } catch {
      setObservationError('No se pudo guardar la observación. Intentá de nuevo.')
    } finally {
      setObservationPending(false)
    }
  }

  return (
    <div id={`finding-detail-${finding.id}`} className="space-y-5 border-t border-border bg-muted/20 px-4 py-5 sm:px-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Detail label="Descripción" value={finding.description} />
        <Detail label="Origen / motivo" value={finding.origin} />
        <Detail label="Base regulatoria" value={finding.regulatoryBasis} />
        <Detail label="Agencia / área" value={finding.agencyArea} />
        <Detail label="Área asignada" value={finding.assignedArea} />
        <Detail label="Estrategia / acción" value={finding.strategy} />
      </div>
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2"><div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seguimiento mensual</h3><p className="mt-1 text-xs text-muted-foreground">Seleccioná un mes para registrar su estado y una nota opcional.</p></div><p className="text-xs text-muted-foreground">Estado actual: <span className="font-semibold text-foreground">{FINDING_STATUSES[finding.status].label}</span></p></div>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
          {MONTHS.map((month, index) => {
            const update = byMonth.get(index + 1)
            const status = update?.status
            const tone = status === 'corrected' ? 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300' : status === 'observed' ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300' : status === 'pending' ? 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300' : 'border-border bg-card text-foreground hover:border-teal-500'
            return <button key={month} type="button" onClick={() => chooseMonth(index + 1)} aria-label={`${MONTHS_LONG[index]}: ${status ? FINDING_STATUSES[status].label : update?.note ? 'Con nota' : 'Sin registro'}`} aria-pressed={selectedMonth === index + 1} className={cn('min-h-16 rounded-lg border px-2 py-2 text-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500', tone, selectedMonth === index + 1 && 'ring-2 ring-teal-500')}><span className="block font-semibold">{month}</span><span className="mt-1 block text-[10px] leading-tight">{status ? FINDING_STATUSES[status].label : update?.note ? 'Con nota' : 'Sin registro'}</span></button>
          })}
        </div>
        {selectedMonth !== null && <form onSubmit={saveMonth} className="mt-3 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold text-foreground">{MONTHS_LONG[selectedMonth - 1]}</h4><button type="button" onClick={() => setSelectedMonth(null)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Cerrar</button></div>
          <div className="grid gap-3 md:grid-cols-[220px_1fr]"><Select label="Estado del mes" value={draftStatus ?? ''} onChange={(event) => setDraftStatus((event.target.value || null) as FindingStatus | null)}><option value="">Sin estado</option>{Object.entries(FINDING_STATUSES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select><Textarea label="Nota de seguimiento" value={draftNote} onChange={(event) => setDraftNote(event.target.value)} rows={2} placeholder="Detalle de la corrección o seguimiento…" /></div>
          {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
          <div className="mt-3 flex gap-2"><Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar mes'}</Button><Button variant="ghost" size="sm" onClick={() => { setDraftStatus(null); setDraftNote('') }} disabled={pending}>Limpiar campos</Button></div>
        </form>}
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Observaciones ({finding.observations.length})</h3>{!observationOpen && <Button variant="ghost" size="sm" onClick={() => setObservationOpen(true)} className="text-blue-700 dark:text-teal-400"><Plus size={14} />Agregar observación</Button>}</div>
        {finding.observations.length === 0 ? <p className="mt-2 text-xs text-muted-foreground">Sin observaciones registradas.</p> : <ul className="mt-2 space-y-2">{finding.observations.map((item) => <li key={item.id} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground text-pretty">{item.text}</li>)}</ul>}
        {observationOpen && <form onSubmit={saveObservation} className="mt-3 space-y-2"><Textarea label="Nueva observación" value={observationText} onChange={(event) => setObservationText(event.target.value)} rows={2} required />{observationError && <p role="alert" className="text-xs text-destructive">{observationError}</p>}<div className="flex gap-2"><Button type="submit" size="sm" disabled={observationPending || !observationText.trim()}>Guardar observación</Button><Button variant="ghost" size="sm" onClick={() => setObservationOpen(false)} disabled={observationPending}>Cancelar</Button></div></form>}
      </section>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h4><p className="mt-1 text-sm text-foreground text-pretty">{value || 'Sin registrar'}</p></div>
}
