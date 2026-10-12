import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={cn(
            'min-h-[84px] w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
              : 'border-input focus:border-teal-500 focus:ring-teal-500/30',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
