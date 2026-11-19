import * as React from 'react'

import { cn } from '@/lib/cn'
import { Icon, type IconName } from './icon'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  icon?: IconName
  sub?: string
  loading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  sub,
  loading,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-well bg-gray-100 p-4', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {icon && (
          <span className="flex size-8 items-center justify-center rounded-full bg-surface">
            <Icon name={icon} active size={18} className="text-primary" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-200/90" />
      ) : (
        <p className="mt-3 text-[26px] font-medium tabular-nums tracking-tight text-gray-900">
          {value}
        </p>
      )}
      {!loading && sub && (
        <p className="mt-1 truncate text-xs text-gray-500">{sub}</p>
      )}
    </div>
  )
}
