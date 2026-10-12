'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, CalendarRange, Building2 } from 'lucide-react'
import type { Plan, Unit } from '@/lib/types'
import { Card, CardBody, CardHeader } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Modal } from '@/components/modal'
import {
  createPlan,
  updatePlan,
  createUnit,
  updateUnit,
  deleteUnit,
} from '@/app/actions'

export function ConfigView({
  plans,
  units,
}: {
  plans: Plan[]
  units: Unit[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PlansPanel plans={plans} />
      <UnitsPanel units={units} />
    </div>
  )
}

function PlansPanel({ plans }: { plans: Plan[] }) {
  const [pending, startTransition] = React.useTransition()
  const [modal, setModal] = React.useState<
    { mode: 'create' | 'edit'; plan?: Plan } | null
  >(null)
  const [year, setYear] = React.useState('')
  const [name, setName] = React.useState('')
  const [status, setStatus] = React.useState('activo')

  const open = (mode: 'create' | 'edit', plan?: Plan) => {
    const y = plan?.year ?? new Date().getFullYear()
    setYear(String(y))
    setName(plan?.name ?? `Plan Operativo Anual ${y}`)
    setStatus(plan?.status ?? 'activo')
    setModal({ mode, plan })
  }

  const submit = () =>
    startTransition(async () => {
      if (!name.trim() || !year) return
      if (modal?.mode === 'create')
        await createPlan({ year: Number(year), name: name.trim() })
      else if (modal?.plan)
        await updatePlan(modal.plan.id, {
          year: Number(year),
          name: name.trim(),
          status,
        })
      setModal(null)
    })

  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <CalendarRange size={18} className="text-blue-700 dark:text-teal-400" />
          Planes Operativos
        </h2>
        <Button size="sm" onClick={() => open('create')}>
          <Plus size={15} />
          Nuevo
        </Button>
      </CardHeader>
      <CardBody className="space-y-2">
        {plans.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay planes. Crea el primero.
          </p>
        )}
        {plans.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700/10 to-teal-500/15 text-xs font-bold text-blue-700 dark:text-teal-400">
              {p.year}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {p.name}
              </p>
            </div>
            <Badge variant={p.status === 'activo' ? 'success' : 'neutral'}>
              {p.status === 'activo' ? 'Activo' : 'Cerrado'}
            </Badge>
            <button
              type="button"
              onClick={() => open('edit', p)}
              aria-label="Editar plan"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil size={15} />
            </button>
          </div>
        ))}
      </CardBody>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Nuevo Plan Operativo' : 'Editar Plan'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={pending}>
              {modal?.mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Año"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <Input
            label="Nombre del plan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {modal?.mode === 'edit' && (
            <Select
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="activo">Activo</option>
              <option value="cerrado">Cerrado</option>
            </Select>
          )}
        </div>
      </Modal>
    </Card>
  )
}

function UnitsPanel({ units }: { units: Unit[] }) {
  const [pending, startTransition] = React.useTransition()
  const [modal, setModal] = React.useState<
    { mode: 'create' | 'edit'; unit?: Unit } | null
  >(null)
  const [name, setName] = React.useState('')

  const open = (mode: 'create' | 'edit', unit?: Unit) => {
    setName(unit?.name ?? '')
    setModal({ mode, unit })
  }

  const submit = () =>
    startTransition(async () => {
      if (!name.trim()) return
      if (modal?.mode === 'create') await createUnit(name.trim())
      else if (modal?.unit) await updateUnit(modal.unit.id, name.trim())
      setModal(null)
    })

  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Building2 size={18} className="text-blue-700 dark:text-teal-400" />
          Unidades operativas
        </h2>
        <Button size="sm" onClick={() => open('create')}>
          <Plus size={15} />
          Nueva
        </Button>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className="mb-1 text-xs text-muted-foreground">
          Responsables de ejecución y evaluación (departamentos, equipos, gerencias).
        </p>
        {units.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay unidades registradas.
          </p>
        )}
        {units.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {u.name}
            </p>
            <button
              type="button"
              onClick={() => open('edit', u)}
              aria-label="Editar unidad"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Eliminar la unidad "${u.name}"?`)) deleteUnit(u.id)
              }}
              aria-label="Eliminar unidad"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </CardBody>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Nueva unidad operativa' : 'Editar unidad'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={pending}>
              {modal?.mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </>
        }
      >
        <Input
          label="Nombre de la unidad"
          placeholder="Ej. Departamento de Contabilidad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Modal>
    </Card>
  )
}
