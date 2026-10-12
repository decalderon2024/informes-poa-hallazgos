import type { ActionMonthStatus, ActionNode, CategoryNode } from '@/lib/types'

export function plannedMonthCount(startMonth: number | null, endMonth: number | null): number {
  if (startMonth === null || endMonth === null || startMonth < 1 || endMonth > 12 || startMonth > endMonth) return 0
  return endMonth - startMonth + 1
}

export function monthlyCompletionPercentage(
  startMonth: number | null,
  endMonth: number | null,
  statuses: ActionMonthStatus[],
): number {
  const planned = plannedMonthCount(startMonth, endMonth)
  if (planned === 0) return 0
  const completed = statuses.filter(({ month, status }) => status === 'done' && month >= startMonth! && month <= endMonth!).length
  return Math.round((completed / planned) * 100)
}

export function flattenActions(tree: CategoryNode[]): ActionNode[] {
  const out: ActionNode[] = []
  for (const c of tree)
    for (const o of c.objectives)
      for (const d of o.descriptors) for (const a of d.actions) out.push(a)
  return out
}

export function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)
}

export type StatusKey =
  | 'completado'
  | 'enAvance'
  | 'enProceso'
  | 'sinIniciar'

export function statusOf(pct: number): StatusKey {
  if (pct >= 100) return 'completado'
  if (pct >= 67) return 'enAvance'
  if (pct >= 34) return 'enProceso'
  if (pct > 0) return 'enProceso'
  return 'sinIniciar'
}

export function planStats(tree: CategoryNode[]) {
  const acts = flattenActions(tree)
  const objectives = tree.reduce((s, c) => s + c.objectives.length, 0)
  const descriptors = tree.reduce(
    (s, c) =>
      s + c.objectives.reduce((ss, o) => ss + o.descriptors.length, 0),
    0,
  )
  const followUps = acts.reduce((s, a) => s + a.followUps.length, 0)
  const overall = avg(acts.map((a) => a.completionPercentage))
  const dist = { completado: 0, enAvance: 0, enProceso: 0, sinIniciar: 0 }
  for (const a of acts) dist[statusOf(a.completionPercentage)]++
  return {
    categories: tree.length,
    objectives,
    descriptors,
    actions: acts.length,
    followUps,
    overall,
    dist,
  }
}

export function categoryProgress(cat: CategoryNode): number {
  const acts: number[] = []
  for (const o of cat.objectives)
    for (const d of o.descriptors)
      for (const a of d.actions) acts.push(a.completionPercentage)
  return avg(acts)
}
