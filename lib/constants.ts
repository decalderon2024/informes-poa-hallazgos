export const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const

export const MONTHS_LONG = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export type CategoryColor =
  | 'navy'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'

export const CATEGORY_COLORS: Record<
  CategoryColor,
  { dot: string; bar: string; soft: string; text: string; label: string }
> = {
  navy: {
    dot: 'bg-navy-900',
    bar: 'from-navy-900 to-blue-700',
    soft: 'bg-[#eaf1f6] dark:bg-[#0f2c47]',
    text: 'text-navy-900 dark:text-[#8fbdda]',
    label: 'Navy',
  },
  blue: {
    dot: 'bg-blue-700',
    bar: 'from-blue-700 to-cyan-600',
    soft: 'bg-[#e8f1f7] dark:bg-[#0f2c47]',
    text: 'text-blue-700 dark:text-[#7fc0e0]',
    label: 'Azul',
  },
  cyan: {
    dot: 'bg-cyan-600',
    bar: 'from-cyan-600 to-teal-500',
    soft: 'bg-[#e5f4f6] dark:bg-[#0d3140]',
    text: 'text-cyan-600 dark:text-[#5fc8d6]',
    label: 'Cian',
  },
  teal: {
    dot: 'bg-teal-500',
    bar: 'from-teal-500 to-green-500',
    soft: 'bg-[#e5f6f6] dark:bg-[#0c3634]',
    text: 'text-teal-600 dark:text-[#4fd0ce]',
    label: 'Turquesa',
  },
  green: {
    dot: 'bg-green-500',
    bar: 'from-green-500 to-teal-500',
    soft: 'bg-[#eaf8ee] dark:bg-[#0d3524]',
    text: 'text-green-600 dark:text-[#6fd995]',
    label: 'Verde',
  },
}

export function progressTone(pct: number) {
  if (pct >= 100) return { badge: 'success' as const, label: 'Completado' }
  if (pct >= 67) return { badge: 'info' as const, label: 'En avance' }
  if (pct >= 34) return { badge: 'warning' as const, label: 'En proceso' }
  if (pct > 0) return { badge: 'warning' as const, label: 'Iniciado' }
  return { badge: 'neutral' as const, label: 'Sin iniciar' }
}
