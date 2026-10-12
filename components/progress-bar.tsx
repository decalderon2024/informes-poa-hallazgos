import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  className,
  showLabel = false,
}: {
  value: number
  className?: string
  showLabel?: boolean
}) {
  const pct = Math.max(0, Math.min(100, value))
  const tone =
    pct >= 100
      ? 'from-green-500 to-teal-500'
      : pct >= 67
        ? 'from-cyan-600 to-teal-500'
        : pct >= 34
          ? 'from-blue-700 to-cyan-600'
          : 'from-blue-700 to-blue-700'
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-2 w-full overflow-hidden rounded-full bg-muted',
          className,
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            tone,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
          {pct}%
        </span>
      )}
    </div>
  )
}
