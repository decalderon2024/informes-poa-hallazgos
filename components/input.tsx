import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, label, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-11 w-full rounded-lg border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              icon && 'pl-10',
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                : 'border-input focus:border-teal-500 focus:ring-teal-500/30',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
