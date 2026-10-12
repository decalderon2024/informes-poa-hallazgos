'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Plus } from 'lucide-react'
import { createFinding, updateFinding } from '@/app/hallazgos/actions'
import { FINDING_STATUSES, type Finding, type FindingInput, type FindingReport } from '@/lib/findings'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Badge } from '@/components/badge'

const EMPTY: FindingInput = {
  reference: '', title: '', description: '', agencyArea: null,
  origin: null, regulatoryBasis: null, assignedArea: null, strategy: null,
}

export function FindingStructure({ report, findings }: { report: FindingReport; findings: Finding[] }) {
  const router = useRouter()
  const [editing, setEditing] = React.useState<number | 'new' | null>(null)
  const [draft, setDraft] = React.useState<FindingInput>(EMPTY)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState('')

  const open = (finding?: Finding) => {
    setEditing(finding?.id ?? 'new')
    setDraft(finding ? {
      reference: finding.reference, title: finding.title, description: finding.description,
      agencyArea: finding.agencyArea, origin: finding.origin,
      regulatoryBasis: finding.regulatoryBasis, assignedArea: finding.assignedArea,
      strategy: finding.strategy,
    } : { ...EMPTY })
    setError('')
  }

  const set = (field: keyof FindingInput, value: string) => setDraft((previous) => ({ ...previous, [field]: value }))

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending || editing === null) return
    setPending(true)
    setError('')
    try {
      if (editing === 'new') await createFinding(report.id, draft)
      else await updateFinding(editing, draft)
      setEditing(null)
      router.refresh()
    } catch {
      setError('No se pudo guardar el hallazgo. Revisá los campos obligatorios e intentá de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold text-foreground">Hallazgos</h2><p className="text-sm text-muted-foreground">{findings.length} {findings.length === 1 ? 'registro' : 'registros'} en este informe.</p></div>
        {editing === null && <Button size="sm" onClick={() => open()}><Plus size={15} />Nuevo hallazgo</Button>}
      </div>
      {editing !== null && (
        <form onSubmit={save} className="rounded-xl border border-teal-500/30 bg-card p-5 shadow-sm">
          <div className="mb-5"><h3 className="text-base font-semibold text-foreground">{editing === 'new' ? 'Nuevo hallazgo' : 'Editar hallazgo'}</h3><p className="text-sm text-muted-foreground">Registra la información del hallazgo; el seguimiento mensual se actualiza desde el reporte.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="N.º de observación" value={draft.reference} onChange={(event) => set('reference', event.target.value)} placeholder="Ej. ENE-(5)" required />
            <Input label="Título" value={draft.title} onChange={(event) => set('title', event.target.value)} required />
            <div className="md:col-span-2"><Textarea label="Descripción" value={draft.description} onChange={(event) => set('description', event.target.value)} rows={3} required /></div>
            <Input label="Agencia / área" value={draft.agencyArea ?? ''} onChange={(event) => set('agencyArea', event.target.value)} />
            <Input label="Área asignada para seguimiento" value={draft.assignedArea ?? ''} onChange={(event) => set('assignedArea', event.target.value)} />
            <Textarea label="Origen / motivo" value={draft.origin ?? ''} onChange={(event) => set('origin', event.target.value)} rows={2} />
            <Textarea label="Base regulatoria" value={draft.regulatoryBasis ?? ''} onChange={(event) => set('regulatoryBasis', event.target.value)} rows={2} />
            <div className="md:col-span-2"><Textarea label="Estrategia / acción" value={draft.strategy ?? ''} onChange={(event) => set('strategy', event.target.value)} rows={3} /></div>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <div className="mt-5 flex gap-2"><Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar hallazgo'}</Button><Button variant="ghost" size="sm" onClick={() => setEditing(null)} disabled={pending}>Cancelar</Button></div>
        </form>
      )}
      {findings.length === 0 && editing === null && (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center"><p className="font-semibold text-foreground">Sin hallazgos registrados</p><p className="mt-1 text-sm text-muted-foreground">Agregá el primero para comenzar el seguimiento.</p></div>
      )}
      <div className="space-y-3">
        {findings.map((finding, index) => (
          <article key={finding.id} className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">{index + 1}</span>
                <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{finding.reference}</p><h3 className="mt-1 text-sm font-semibold text-foreground text-pretty">{finding.title}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground text-pretty">{finding.description}</p></div>
              </div>
              <div className="flex items-center gap-2"><Badge variant={FINDING_STATUSES[finding.status].badge}>{FINDING_STATUSES[finding.status].label}</Badge><Button variant="ghost" size="sm" onClick={() => open(finding)} aria-label={`Editar ${finding.reference}`}><Pencil size={15} />Editar</Button></div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><span>{finding.agencyArea || 'Sin agencia / área'} · {finding.assignedArea || 'Sin área asignada'}</span><Link className="font-semibold text-blue-700 hover:underline dark:text-teal-400" href={`/hallazgos/reporte?informe=${report.id}`}>Ver en reporte</Link></div>
          </article>
        ))}
      </div>
    </div>
  )
}
