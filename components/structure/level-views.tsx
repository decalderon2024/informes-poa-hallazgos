'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Plus, Target } from 'lucide-react'
import type { CategoryNode } from '@/lib/types'
import { CATEGORY_COLORS, type CategoryColor } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Card, CardBody } from '@/components/card'
import { Button } from '@/components/button'
import { Modal } from '@/components/modal'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Select } from '@/components/select'
import { EmptyState } from '@/components/empty-state'
import { createCategory, createObjective } from '@/app/actions'

const colors = Object.keys(CATEGORY_COLORS) as CategoryColor[]

function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">← {children}</Link>
}

export function CategoriesView({ categories, plans, planId }: { categories: CategoryNode[]; plans: { id: number; year: number }[]; planId: number }) {
  const [open, setOpen] = React.useState(false)
  const year = plans.find((p) => p.id === planId)?.year
  return <div className="space-y-5">
    <Card><CardBody><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Año seleccionado</p><p className="mt-1 flex items-center gap-2 text-xl font-bold text-foreground"><CalendarDays size={19} className="text-teal-500" />{year}</p></div><div className="flex items-center gap-4"><span className="text-sm text-muted-foreground">{categories.length} categorías</span><Button size="sm" onClick={() => setOpen(true)}><Plus size={15}/>Nueva categoría</Button></div></div></CardBody></Card>
    {categories.length === 0 ? <EmptyState icon={<Target size={24}/>} title="No hay categorías para este año" description="Crea la primera clasificación del POA." action={<Button onClick={() => setOpen(true)}><Plus size={15}/>Nueva categoría</Button>} /> : <div className="grid gap-4 md:grid-cols-2">{categories.map((cat) => { const color = CATEGORY_COLORS[cat.color as CategoryColor] ?? CATEGORY_COLORS.blue; return <Card key={cat.id}><CardBody><div className="flex gap-3"><span className={cn('h-10 w-1.5 rounded-full', color.dot)}/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-foreground">{cat.name}</h2><p className="mt-1 text-sm text-muted-foreground">{cat.description || 'Sin descripción'}</p></div><span className={cn('rounded-full px-2 py-1 text-xs font-semibold', color.soft, color.text)}>{cat.objectives.length} objetivos</span></div><Link href={`/estructura/categoria/${cat.id}?plan=${planId}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline dark:text-teal-400">Ver objetivos <ArrowRight size={15}/></Link></div></div></CardBody></Card> })}</div>}
    <CategoryModal open={open} onClose={() => setOpen(false)} planId={planId}/>
  </div>
}

export function ObjectivesView({ category, planId }: { category: CategoryNode; planId: number }) {
  const [adding, setAdding] = React.useState(false)
  const [text, setText] = React.useState('')
  const [error, setError] = React.useState('')
  const [saved, setSaved] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const objectiveRef = React.useRef<HTMLTextAreaElement>(null)

  const saveObjective = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    if (!text.trim()) {
      setError('Escribí el objetivo antes de guardarlo.')
      objectiveRef.current?.focus()
      return
    }
    setError('')
    startTransition(async () => {
      try {
        await createObjective({ categoryId: category.id, text: text.trim() })
        setText('')
        setSaved(true)
        objectiveRef.current?.focus()
      } catch {
        setError('No se pudo guardar el objetivo. Intentá de nuevo.')
      }
    })
  }

  return (
    <div className="space-y-5">
      <Back href={`/estructura?plan=${planId}`}>Volver a categorías</Back>
      <Card>
        <CardBody>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoría</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{category.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-foreground">Objetivos</h3>
          <p className="text-sm text-muted-foreground">Agregá objetivos aquí y abrí cada uno para gestionar sus descriptores.</p>
        </div>
        <Button size="sm" onClick={() => { setAdding(true); setSaved(false) }} disabled={adding}>
          <Plus size={15} />Nuevo objetivo
        </Button>
      </div>

      {adding && (
        <form onSubmit={saveObjective} className="rounded-xl border border-teal-500/50 bg-card p-4 shadow-sm" aria-label="Nuevo objetivo">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-foreground">Nuevo objetivo</h4>
              <p className="text-xs text-muted-foreground">Al guardarlo, podrás escribir el siguiente sin salir de esta pantalla.</p>
            </div>
            <button type="button" onClick={() => { setAdding(false); setSaved(false); setError('') }} disabled={pending} className="text-sm text-muted-foreground hover:text-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">Cerrar</button>
          </div>
          <Textarea ref={objectiveRef} label="Objetivo" rows={3} required autoFocus value={text} onChange={(event) => { setText(event.target.value); setError(''); setSaved(false) }} placeholder="Redacta el objetivo del plan" />
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
          {saved && <p role="status" className="mt-2 text-sm text-green-600 dark:text-green-500">Objetivo guardado. Podés agregar otro.</p>}
          <div className="mt-3 flex justify-end"><Button size="sm" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar objetivo'}</Button></div>
        </form>
      )}

      {category.objectives.length === 0 ? (
        !adding && <EmptyState icon={<Target size={24} />} title="No hay objetivos" description="Agrega el primer objetivo de esta categoría." action={<Button onClick={() => setAdding(true)}><Plus size={15} />Nuevo objetivo</Button>} />
      ) : (
        <div className="space-y-3">
          {category.objectives.map((obj, index) => (
            <Card key={obj.id}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700/10 text-sm font-bold text-blue-700 dark:bg-teal-500/10 dark:text-teal-400">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-pretty">{obj.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{obj.descriptors.length} descriptores registrados</p>
                  </div>
                  <Link href={`/estructura/objetivo/${obj.id}?plan=${planId}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400">Abrir <ArrowRight size={15} /></Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryModal({ open, onClose, planId }: { open: boolean; onClose: () => void; planId: number }) { const [name, setName] = React.useState(''); const [description, setDescription] = React.useState(''); const [color, setColor] = React.useState<CategoryColor>('blue'); const [pending, start] = React.useTransition(); return <Modal open={open} onClose={onClose} title="Nueva categoría" footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={pending} onClick={() => start(async () => { if (!name.trim()) return; await createCategory({ planId, name: name.trim(), description: description.trim(), color }); onClose() })}>Crear categoría</Button></>}><div className="space-y-4"><Input label="Nombre de la categoría" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Económico" required/><Textarea label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)}/><Select label="Color distintivo" value={color} onChange={(e) => setColor(e.target.value as CategoryColor)}>{colors.map((key) => <option key={key} value={key}>{CATEGORY_COLORS[key].label}</option>)}</Select></div></Modal> }
