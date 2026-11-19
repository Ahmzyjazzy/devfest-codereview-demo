import * as React from 'react'

import { cn } from '@/lib/cn'

export interface WellHeaderProps {
  title: React.ReactNode
  count?: number
  description?: React.ReactNode
  caption?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function WellHeader({
  title,
  count,
  description,
  caption,
  action,
  className,
}: WellHeaderProps) {
  return (
    <div
      className={cn(
        'flex justify-between px-4 pb-2.5 pt-3',
        caption != null
          ? 'flex-wrap items-baseline gap-x-3 gap-y-1'
          : 'items-start gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-medium tracking-tight text-gray-900">
          {title}
          {count != null && (
            <span className="ml-1.5 font-normal tabular-nums text-gray-400">
              {count.toLocaleString()}
            </span>
          )}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {caption != null && (
        <span className="text-xs text-gray-500">{caption}</span>
      )}
      {action && <div className="-my-1 shrink-0">{action}</div>}
    </div>
  )
}
