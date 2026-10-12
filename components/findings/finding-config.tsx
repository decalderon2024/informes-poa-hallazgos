'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CalendarRange, Pencil, Plus } from 'lucide-react'
import { createFindingReport, updateFindingReport } from '@/app/hallazgos/actions'
import type { FindingReport } from '@/lib/findings'
import { Card, CardBody, CardHeader } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Badge } from '@/components/badge'

export function FindingConfig({ reports }: { reports: FindingReport[] }) {
  const router = useRouter()
  const [editing, setEditing] = React.useState<number | 'new' | null>(null)
  const [year, setYear] = React.useState('')
  const [name, setName] = React.useState('')
  const [status, setStatus] = React.useState<'activo' | 'cerrado'>('activo')
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState('')

  const open = (report?: FindingReport) => {
    const nextYear = report?.year ?? new Date().getFullYear()
    setEditing(report?.id ?? 'new')
    setYear(String(nextYear))
    setName(report?.name ?? `Seguimiento de hallazgos ${nextYear}`)
    setStatus(report?.status ?? 'activo')
    setError('')
  }

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    try {
      const data = { year: Number(year), name: name.trim() }
      if (editing === 'new') {
        const id = await createFindingReport(data)
        setEditing(null)
        router.push(`/hallazgos/estructura?informe=${id}`)
      } else if (typeof editing === 'number') {
        await updateFindingReport(editing, { ...data, status })
        setEditing(null)
        router.refresh()
      }
    } catch {
      setError('No se pudo guardar el informe. Revisá los datos e intentá de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-semibold"><CalendarRange size={18} className="text-blue-700 dark:text-teal-400" />Informes de hallazgos</h2>
        {editing === null && <Button size="sm" onClick={() => open()}><Plus size={15} />Nuevo informe</Button>}
      </CardHeader>
      <CardBody className="space-y-4">
        {editing !== null && (
          <form onSubmit={save} className="rounded-xl border border-teal-500/30 bg-sidebar-accent/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Año" type="number" min="1900" max="2100" value={year} onChange={(event) => setYear(event.target.value)} required />
              <Input label="Nombre del informe" value={name} onChange={(event) => setName(event.target.value)} required />
              {editing !== 'new' && <Select label="Estado" value={status} onChange={(event) => setStatus(event.target.value as 'activo' | 'cerrado')}><option value="activo">Activo</option><option value="cerrado">Cerrado</option></Select>}
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-4 flex gap-2"><Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar informe'}</Button><Button variant="ghost" size="sm" onClick={() => setEditing(null)} disabled={pending}>Cancelar</Button></div>
          </form>
        )}
        {reports.length === 0 && editing === null && <p className="py-6 text-center text-sm text-muted-foreground">No hay informes registrados. Creá el primero para empezar.</p>}
        {reports.map((report) => (
          <div key={report.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">{report.year}</span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{report.name}</p><p className="text-xs text-muted-foreground">Informe anual</p></div>
            <Badge variant={report.status === 'activo' ? 'success' : 'neutral'}>{report.status === 'activo' ? 'Activo' : 'Cerrado'}</Badge>
            <Button variant="ghost" size="sm" onClick={() => open(report)} aria-label={`Editar ${report.name}`}><Pencil size={15} />Editar</Button>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
