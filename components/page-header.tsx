import * as React from 'react'

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && <nav aria-label="Migas de pan" className="mb-2 flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground">{breadcrumbs}</nav>}
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
