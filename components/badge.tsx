import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'info' | 'warning' | 'error' | 'neutral'
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  success:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30',
  info: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-200 dark:border-teal-500/30',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  error:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  neutral:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/15',
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold leading-none',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
