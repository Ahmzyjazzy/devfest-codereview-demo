import * as React from 'react'

import { cn } from '@/lib/cn'

export interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: string
  actions?: React.ReactNode
  eyebrow?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-sm text-gray-500">{eyebrow}</div>}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-base text-gray-500">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
