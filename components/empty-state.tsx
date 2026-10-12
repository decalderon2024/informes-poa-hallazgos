import * as React from 'react'
import { Card, CardBody } from '@/components/card'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          )}
        </div>
        {action}
      </CardBody>
    </Card>
  )
}
