import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-4 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-8 text-base gap-2',
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'text-white bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500 shadow-sm hover:shadow-md hover:brightness-105',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border-2 border-blue-700 text-blue-700 bg-transparent hover:bg-blue-700 hover:text-white dark:border-teal-500 dark:text-teal-500 dark:hover:bg-teal-500 dark:hover:text-[#04222f]',
  ghost:
    'bg-transparent text-foreground hover:bg-muted',
  danger:
    'bg-transparent border border-destructive/40 text-destructive hover:bg-destructive hover:text-white',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', fullWidth, type, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
          sizes[size],
          variants[variant],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
