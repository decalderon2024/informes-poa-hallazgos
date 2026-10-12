export type FindingStatus = 'corrected' | 'observed' | 'pending'

export type FindingReport = {
  id: number
  year: number
  name: string
  status: 'activo' | 'cerrado'
}

export type FindingMonthUpdate = {
  month: number
  status: FindingStatus | null
  note: string | null
}

export type FindingObservation = {
  id: number
  text: string
  createdAt: string
}

export type Finding = {
  id: number
  reportId: number
  reference: string
  title: string
  description: string
  agencyArea: string | null
  origin: string | null
  regulatoryBasis: string | null
  assignedArea: string | null
  strategy: string | null
  monthUpdates: FindingMonthUpdate[]
  observations: FindingObservation[]
  status: FindingStatus
  lastUpdateMonth: number | null
}

export type FindingInput = Pick<
  Finding,
  'reference' | 'title' | 'description' | 'agencyArea' | 'origin' | 'regulatoryBasis' | 'assignedArea' | 'strategy'
>

export const FINDING_STATUSES: Record<FindingStatus, { label: string; badge: 'success' | 'warning' | 'error' }> = {
  corrected: { label: 'Corregido', badge: 'success' },
  observed: { label: 'En observación', badge: 'warning' },
  pending: { label: 'Pendiente de corrección', badge: 'error' },
}

export function findingStatus(updates: FindingMonthUpdate[]): FindingStatus {
  return [...updates]
    .filter((update) => update.status !== null)
    .sort((a, b) => b.month - a.month)[0]?.status ?? 'pending'
}

export function findingStats(findings: Finding[]) {
  const corrected = findings.filter((finding) => finding.status === 'corrected').length
  const observed = findings.filter((finding) => finding.status === 'observed').length
  const pending = findings.length - corrected - observed
  return {
    total: findings.length,
    corrected,
    observed,
    pending,
    correctionRate: findings.length ? Math.round((corrected / findings.length) * 100) : 0,
  }
}

export function resolveFindingReportId(reports: FindingReport[], raw?: string): number | null {
  if (reports.length === 0) return null
  const parsed = raw ? Number(raw) : NaN
  return reports.some((report) => report.id === parsed) ? parsed : reports[reports.length - 1].id
}
