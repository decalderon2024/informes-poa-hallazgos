import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'h-11 w-full appearance-none rounded-lg border bg-card px-3 pr-9 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                : 'border-input focus:border-teal-500 focus:ring-teal-500/30',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'
