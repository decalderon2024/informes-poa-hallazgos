'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { findingMonthUpdates, findingObservations, findingReports, findings } from '@/lib/db/schema'
import type { FindingInput, FindingStatus } from '@/lib/findings'

function refreshFindings() {
  revalidatePath('/hallazgos/estructura')
  revalidatePath('/hallazgos/reporte')
  revalidatePath('/hallazgos/configuracion')
  revalidatePath('/', 'layout')
}

function required(value: string, label: string) {
  const text = value.trim()
  if (!text) throw new Error(`${label} es obligatorio.`)
  return text
}

function optional(value: string | null) {
  return value?.trim() || null
}

function normalizeFinding(input: FindingInput) {
  return {
    reference: required(input.reference, 'El número de observación'),
    title: required(input.title, 'El título'),
    description: required(input.description, 'La descripción'),
    agencyArea: optional(input.agencyArea),
    origin: optional(input.origin),
    regulatoryBasis: optional(input.regulatoryBasis),
    assignedArea: optional(input.assignedArea),
    strategy: optional(input.strategy),
  }
}

export async function createFindingReport(data: { year: number; name: string }) {
  if (!Number.isInteger(data.year) || data.year < 1900 || data.year > 2100) throw new Error('Año inválido.')
  const [report] = await db.insert(findingReports).values({ year: data.year, name: required(data.name, 'El nombre') }).returning({ id: findingReports.id })
  refreshFindings()
  return report.id
}

export async function updateFindingReport(id: number, data: { year: number; name: string; status: 'activo' | 'cerrado' }) {
  if (!Number.isInteger(id) || !Number.isInteger(data.year) || data.year < 1900 || data.year > 2100) throw new Error('Informe inválido.')
  if (data.status !== 'activo' && data.status !== 'cerrado') throw new Error('Estado inválido.')
  await db.update(findingReports).set({ year: data.year, name: required(data.name, 'El nombre'), status: data.status }).where(eq(findingReports.id, id))
  refreshFindings()
}

export async function createFinding(reportId: number, input: FindingInput) {
  if (!Number.isInteger(reportId)) throw new Error('Informe inválido.')
  await db.insert(findings).values({ reportId, ...normalizeFinding(input) })
  refreshFindings()
}

export async function updateFinding(id: number, input: FindingInput) {
  if (!Number.isInteger(id)) throw new Error('Hallazgo inválido.')
  await db.update(findings).set(normalizeFinding(input)).where(eq(findings.id, id))
  refreshFindings()
}

export async function setFindingMonthUpdate(
  findingId: number,
  month: number,
  status: FindingStatus | null,
  note: string,
) {
  if (!Number.isInteger(findingId) || !Number.isInteger(month) || month < 1 || month > 12) throw new Error('Hallazgo o mes inválido.')
  if (status !== null && !['corrected', 'observed', 'pending'].includes(status)) throw new Error('Estado inválido.')
  const cleanNote = optional(note)
  const condition = and(eq(findingMonthUpdates.findingId, findingId), eq(findingMonthUpdates.month, month))
  if (!status && !cleanNote) {
    await db.delete(findingMonthUpdates).where(condition)
  } else {
    await db.insert(findingMonthUpdates).values({ findingId, month, status, note: cleanNote }).onConflictDoUpdate({
      target: [findingMonthUpdates.findingId, findingMonthUpdates.month],
      set: { status, note: cleanNote },
    })
  }
  refreshFindings()
}

export async function createFindingObservation(findingId: number, text: string) {
  if (!Number.isInteger(findingId)) throw new Error('Hallazgo inválido.')
  await db.insert(findingObservations).values({ findingId, text: required(text, 'La observación') })
  refreshFindings()
}
