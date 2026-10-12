import type {
  CategoryNode,
  ObjectiveNode,
  DescriptorNode,
  ActionNode,
} from '@/lib/types'

export type ReportRow = {
  key: string
  category: CategoryNode
  objective?: ObjectiveNode
  descriptor?: DescriptorNode
  action?: ActionNode
  // rowspans (only set > 0 on the first row of the group)
  categorySpan: number
  objectiveSpan: number
  descriptorSpan: number
}

/**
 * Flattens the plan tree into report rows at the action grain.
 * Descriptors, objectives and categories without children still yield a row
 * so the whole structure is visible. rowspans are computed so grouped cells
 * render once per group.
 */
export function buildReportRows(tree: CategoryNode[]): ReportRow[] {
  const rows: Omit<
    ReportRow,
    'categorySpan' | 'objectiveSpan' | 'descriptorSpan'
  >[] = []

  for (const category of tree) {
    if (category.objectives.length === 0) {
      rows.push({ key: `c${category.id}`, category })
      continue
    }
    for (const objective of category.objectives) {
      if (objective.descriptors.length === 0) {
        rows.push({ key: `o${objective.id}`, category, objective })
        continue
      }
      for (const descriptor of objective.descriptors) {
        if (descriptor.actions.length === 0) {
          rows.push({ key: `d${descriptor.id}`, category, objective, descriptor })
          continue
        }
        for (const action of descriptor.actions) {
          rows.push({
            key: `a${action.id}`,
            category,
            objective,
            descriptor,
            action,
          })
        }
      }
    }
  }

  const countBy = <T,>(get: (r: (typeof rows)[number]) => T | undefined) => {
    const counts = new Map<T, number>()
    for (const r of rows) {
      const v = get(r)
      if (v === undefined) continue
      counts.set(v, (counts.get(v) ?? 0) + 1)
    }
    return counts
  }

  const catCounts = countBy((r) => r.category.id)
  const objCounts = countBy((r) => r.objective?.id)
  const descCounts = countBy((r) => r.descriptor?.id)

  const seenCat = new Set<number>()
  const seenObj = new Set<number>()
  const seenDesc = new Set<number>()

  return rows.map((r) => {
    let categorySpan = 0
    let objectiveSpan = 0
    let descriptorSpan = 0

    if (!seenCat.has(r.category.id)) {
      seenCat.add(r.category.id)
      categorySpan = catCounts.get(r.category.id) ?? 1
    }
    if (r.objective && !seenObj.has(r.objective.id)) {
      seenObj.add(r.objective.id)
      objectiveSpan = objCounts.get(r.objective.id) ?? 1
    }
    if (r.descriptor && !seenDesc.has(r.descriptor.id)) {
      seenDesc.add(r.descriptor.id)
      descriptorSpan = descCounts.get(r.descriptor.id) ?? 1
    }

    return { ...r, categorySpan, objectiveSpan, descriptorSpan }
  })
}
