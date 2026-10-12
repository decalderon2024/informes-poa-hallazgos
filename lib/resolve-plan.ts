import type { Plan } from '@/lib/types'

export function resolvePlanId(
  plans: Plan[],
  planParam?: string | string[],
): number | null {
  if (plans.length === 0) return null
  const raw = Array.isArray(planParam) ? planParam[0] : planParam
  const parsed = raw ? Number(raw) : NaN
  if (!Number.isNaN(parsed) && plans.some((p) => p.id === parsed)) {
    return parsed
  }
  return plans[plans.length - 1].id
}
