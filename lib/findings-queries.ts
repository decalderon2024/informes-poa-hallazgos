import 'server-only'

import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { findingMonthUpdates, findingObservations, findingReports, findings } from '@/lib/db/schema'
import { findingStatus, type Finding, type FindingReport } from '@/lib/findings'

export async function getFindingReports(): Promise<FindingReport[]> {
  const rows = await db.select().from(findingReports).orderBy(asc(findingReports.year), asc(findingReports.id))
  return rows.map(({ id, year, name, status }) => ({ id, year, name, status }))
}

export async function getFindings(reportId: number): Promise<Finding[]> {
  const rows = await db.select().from(findings)
    .where(eq(findings.reportId, reportId))
    .orderBy(asc(findings.sortOrder), asc(findings.id))
  if (rows.length === 0) return []

  const ids = rows.map((row) => row.id)
  const [months, notes] = await Promise.all([
    db.select().from(findingMonthUpdates)
      .where(inArray(findingMonthUpdates.findingId, ids))
      .orderBy(asc(findingMonthUpdates.month)),
    db.select().from(findingObservations)
      .where(inArray(findingObservations.findingId, ids))
      .orderBy(asc(findingObservations.id)),
  ])
  const monthsByFinding = new Map<number, Finding['monthUpdates']>()
  const notesByFinding = new Map<number, Finding['observations']>()
  for (const month of months) {
    const list = monthsByFinding.get(month.findingId) ?? []
    list.push({ month: month.month, status: month.status, note: month.note })
    monthsByFinding.set(month.findingId, list)
  }
  for (const note of notes) {
    const list = notesByFinding.get(note.findingId) ?? []
    list.push({ id: note.id, text: note.text, createdAt: note.createdAt.toISOString() })
    notesByFinding.set(note.findingId, list)
  }

  return rows.map((row) => {
    const monthUpdates = monthsByFinding.get(row.id) ?? []
    return {
      id: row.id,
      reportId: row.reportId,
      reference: row.reference,
      title: row.title,
      description: row.description,
      agencyArea: row.agencyArea,
      origin: row.origin,
      regulatoryBasis: row.regulatoryBasis,
      assignedArea: row.assignedArea,
      strategy: row.strategy,
      monthUpdates,
      observations: notesByFinding.get(row.id) ?? [],
      status: findingStatus(monthUpdates),
      lastUpdateMonth: monthUpdates.length ? Math.max(...monthUpdates.map((month) => month.month)) : null,
    }
  })
}
