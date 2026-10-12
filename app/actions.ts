'use server'

import { db } from '@/lib/db'
import {
  plans,
  units,
  categories,
  objectives,
  descriptors,
  actions,
  actionMonthStatuses,
  followUps,
  observations,
} from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function refresh() {
  revalidatePath('/')
  revalidatePath('/estructura')
  revalidatePath('/reporte')
  revalidatePath('/unidades')
}

/* ------------------------------- Plans -------------------------------- */

export async function createPlan(data: { year: number; name: string }) {
  const [row] = await db
    .insert(plans)
    .values({ year: data.year, name: data.name })
    .returning()
  refresh()
  return row.id
}

export async function updatePlan(
  id: number,
  data: { year: number; name: string; status: string },
) {
  await db.update(plans).set(data).where(eq(plans.id, id))
  refresh()
}

/* ------------------------------- Units -------------------------------- */

export async function createUnit(name: string) {
  await db.insert(units).values({ name })
  refresh()
}

export async function updateUnit(id: number, name: string) {
  await db.update(units).set({ name }).where(eq(units.id, id))
  refresh()
}

export async function deleteUnit(id: number) {
  await db.delete(units).where(eq(units.id, id))
  refresh()
}

/* ----------------------------- Categories ----------------------------- */

export async function createCategory(data: {
  planId: number
  name: string
  description?: string
  color: string
}) {
  await db.insert(categories).values({
    planId: data.planId,
    name: data.name,
    description: data.description || null,
    color: data.color,
  })
  refresh()
}

export async function updateCategory(
  id: number,
  data: { name: string; description?: string; color: string },
) {
  await db
    .update(categories)
    .set({
      name: data.name,
      description: data.description || null,
      color: data.color,
    })
    .where(eq(categories.id, id))
  refresh()
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id))
  refresh()
}

/* ----------------------------- Objectives ----------------------------- */

export async function createObjective(data: {
  categoryId: number
  text: string
}) {
  await db.insert(objectives).values(data)
  refresh()
}

export async function updateObjective(id: number, text: string) {
  await db.update(objectives).set({ text }).where(eq(objectives.id, id))
  refresh()
}

export async function deleteObjective(id: number) {
  await db.delete(objectives).where(eq(objectives.id, id))
  refresh()
}

/* ---------------------------- Descriptors ----------------------------- */

export async function createDescriptor(data: {
  objectiveId: number
  text: string
  initiative?: string
  indicator?: string
}) {
  await db.insert(descriptors).values({
    objectiveId: data.objectiveId,
    text: data.text,
    initiative: data.initiative || null,
    indicator: data.indicator || null,
  })
  refresh()
}

export async function updateDescriptor(
  id: number,
  data: { text: string; initiative?: string; indicator?: string },
) {
  await db
    .update(descriptors)
    .set({
      text: data.text,
      initiative: data.initiative || null,
      indicator: data.indicator || null,
    })
    .where(eq(descriptors.id, id))
  refresh()
}

export async function deleteDescriptor(id: number) {
  await db.delete(descriptors).where(eq(descriptors.id, id))
  refresh()
}

/* ------------------------------ Actions ------------------------------- */

export async function createAction(data: {
  descriptorId: number
  description: string
  executionUnitId: number | null
  evaluationUnitId: number | null
  startMonth: number | null
  endMonth: number | null
}) {
  await db.insert(actions).values(data)
  refresh()
}

export async function updateAction(
  id: number,
  data: {
    description: string
    executionUnitId: number | null
    evaluationUnitId: number | null
    startMonth: number | null
    endMonth: number | null
  },
) {
  await db.update(actions).set(data).where(eq(actions.id, id))
  refresh()
}

export async function setActionMonthStatus(
  actionId: number,
  month: number,
  status: 'done' | 'missed' | null,
) {
  if (!Number.isInteger(actionId) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Acción o mes inválido.')
  }
  if (status !== null && status !== 'done' && status !== 'missed') {
    throw new Error('Estado mensual inválido.')
  }
  const [action] = await db
    .select({ startMonth: actions.startMonth, endMonth: actions.endMonth })
    .from(actions)
    .where(eq(actions.id, actionId))
  if (!action || action.startMonth === null || action.endMonth === null || month < action.startMonth || month > action.endMonth) {
    throw new Error('Este mes no está planificado para la acción.')
  }

  if (status === null) {
    await db.delete(actionMonthStatuses).where(and(eq(actionMonthStatuses.actionId, actionId), eq(actionMonthStatuses.month, month)))
  } else {
    await db.insert(actionMonthStatuses).values({ actionId, month, status }).onConflictDoUpdate({
      target: [actionMonthStatuses.actionId, actionMonthStatuses.month],
      set: { status },
    })
  }
  refresh()
}

export async function deleteAction(id: number) {
  await db.delete(actions).where(eq(actions.id, id))
  refresh()
}

/* ----------------------------- Follow-ups ----------------------------- */

export async function createFollowUp(data: {
  actionId: number
  month: number
  executionComment?: string
}) {
  await db.insert(followUps).values({
    actionId: data.actionId,
    month: data.month,
    executionComment: data.executionComment || null,
  })
  refresh()
}

export async function updateFollowUp(
  id: number,
  data: { month: number; executionComment?: string; evaluationResponse?: string },
) {
  await db
    .update(followUps)
    .set({
      month: data.month,
      executionComment: data.executionComment || null,
      evaluationResponse: data.evaluationResponse || null,
    })
    .where(eq(followUps.id, id))
  refresh()
}

export async function respondFollowUp(id: number, evaluationResponse: string) {
  await db
    .update(followUps)
    .set({ evaluationResponse: evaluationResponse || null })
    .where(eq(followUps.id, id))
  refresh()
}

export async function deleteFollowUp(id: number) {
  await db.delete(followUps).where(eq(followUps.id, id))
  refresh()
}

/* ---------------------------- Observations ---------------------------- */

export async function createObservation(data: {
  actionId: number
  text: string
}) {
  await db.insert(observations).values(data)
  refresh()
}

export async function deleteObservation(id: number) {
  await db.delete(observations).where(eq(observations.id, id))
  refresh()
}
