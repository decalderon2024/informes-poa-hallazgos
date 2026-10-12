import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'subtle'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variant === 'default' &&
          'bg-card text-card-foreground border border-border shadow-sm',
        variant === 'gradient' &&
          'bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 text-white rounded-3xl shadow-lg',
        variant === 'subtle' && 'bg-muted border border-border',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4',
        className,
      )}
      {...props}
    />
  )
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-5', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-border/70 px-5 py-4',
        className,
      )}
      {...props}
    />
  )
}
