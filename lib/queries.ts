import 'server-only'
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
import { asc, eq, inArray } from 'drizzle-orm'
import type {
  CategoryNode,
  Plan,
  Unit,
  ActionNode,
} from '@/lib/types'
import { monthlyCompletionPercentage } from '@/lib/stats'

export async function getPlans(): Promise<Plan[]> {
  const rows = await db.select().from(plans).orderBy(asc(plans.year))
  return rows.map((p) => ({
    id: p.id,
    year: p.year,
    name: p.name,
    status: p.status,
  }))
}

export async function getUnits(): Promise<Unit[]> {
  const rows = await db.select().from(units).orderBy(asc(units.name))
  return rows.map((u) => ({ id: u.id, name: u.name }))
}

export async function getPlanTree(planId: number): Promise<CategoryNode[]> {
  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.planId, planId))
    .orderBy(asc(categories.sortOrder), asc(categories.id))

  if (cats.length === 0) return []

  const catIds = cats.map((c) => c.id)
  const objs = await db
    .select()
    .from(objectives)
    .where(inArray(objectives.categoryId, catIds))
    .orderBy(asc(objectives.sortOrder), asc(objectives.id))

  const objIds = objs.map((o) => o.id)
  const descs = objIds.length
    ? await db
        .select()
        .from(descriptors)
        .where(inArray(descriptors.objectiveId, objIds))
        .orderBy(asc(descriptors.sortOrder), asc(descriptors.id))
    : []

  const descIds = descs.map((d) => d.id)
  const acts = descIds.length
    ? await db
        .select()
        .from(actions)
        .where(inArray(actions.descriptorId, descIds))
        .orderBy(asc(actions.sortOrder), asc(actions.id))
    : []

  const actIds = acts.map((a) => a.id)
  const monthStatusRows = actIds.length
    ? await db
        .select()
        .from(actionMonthStatuses)
        .where(inArray(actionMonthStatuses.actionId, actIds))
        .orderBy(asc(actionMonthStatuses.month))
    : []
  const fups = actIds.length
    ? await db
        .select()
        .from(followUps)
        .where(inArray(followUps.actionId, actIds))
        .orderBy(asc(followUps.month), asc(followUps.id))
    : []
  const obs = actIds.length
    ? await db
        .select()
        .from(observations)
        .where(inArray(observations.actionId, actIds))
        .orderBy(asc(observations.id))
    : []

  const unitRows = await db.select().from(units)
  const unitMap = new Map(unitRows.map((u) => [u.id, u.name]))

  const actionNodes: ActionNode[] = acts.map((a) => {
    const monthStatuses = monthStatusRows
      .filter((row) => row.actionId === a.id)
      .map((row) => ({ month: row.month, status: row.status }))
    return {
    id: a.id,
    descriptorId: a.descriptorId,
    description: a.description,
    executionUnitId: a.executionUnitId,
    evaluationUnitId: a.evaluationUnitId,
    executionUnitName: a.executionUnitId
      ? (unitMap.get(a.executionUnitId) ?? null)
      : null,
    evaluationUnitName: a.evaluationUnitId
      ? (unitMap.get(a.evaluationUnitId) ?? null)
      : null,
    startMonth: a.startMonth,
    endMonth: a.endMonth,
    completionPercentage: monthlyCompletionPercentage(a.startMonth, a.endMonth, monthStatuses),
    monthStatuses,
    followUps: fups
      .filter((f) => f.actionId === a.id)
      .map((f) => ({
        id: f.id,
        actionId: f.actionId,
        month: f.month,
        executionComment: f.executionComment,
        evaluationResponse: f.evaluationResponse,
        createdAt: f.createdAt.toISOString(),
      })),
    observations: obs
      .filter((o) => o.actionId === a.id)
      .map((o) => ({
        id: o.id,
        actionId: o.actionId,
        text: o.text,
        createdAt: o.createdAt.toISOString(),
      })),
    }
  })

  return cats.map((c) => ({
    id: c.id,
    planId: c.planId,
    name: c.name,
    description: c.description,
    color: c.color,
    objectives: objs
      .filter((o) => o.categoryId === c.id)
      .map((o) => ({
        id: o.id,
        categoryId: o.categoryId,
        text: o.text,
        descriptors: descs
          .filter((d) => d.objectiveId === o.id)
          .map((d) => ({
            id: d.id,
            objectiveId: d.objectiveId,
            text: d.text,
            initiative: d.initiative,
            indicator: d.indicator,
            actions: actionNodes.filter((a) => a.descriptorId === d.id),
          })),
      })),
  }))
}
