import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/format'
import {
  EmptyRows,
  Pill,
  QuietButton,
  SheetTable,
  type PillTone,
} from '@/components/ui/list-kit'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { OPEN_STATUSES, STATUS_OPTIONS, STATUS_TONE, type Lead } from '@/types'

const BAR: Record<PillTone, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  gray: 'bg-gray-400',
}

export function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reduce = useReducedMotion()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setLeads(await api.listLeads())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const open = leads.filter(l => OPEN_STATUSES.includes(l.status))
    const won = leads.filter(l => l.status === 'Closed Won')
    return {
      total: leads.length,
      open: open.length,
      wonEstimate: won.reduce((sum, l) => sum + l.value, 0),
      pipelineEstimate: open.reduce((sum, l) => sum + l.value, 0),
      byStatus: STATUS_OPTIONS.map(status => ({
        status,
        count: leads.filter(l => l.status === status).length,
      })),
    }
  }, [leads])

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="How Ade’s Kitchen’s catering pipeline is shaping up."
      />

      {error ? (
        <SheetTable>
          <EmptyRows
            icon="danger-triangle"
            title="Could not load the dashboard"
            body={error}
            action={
              <QuietButton icon="refresh" onClick={load}>
                Try again
              </QuietButton>
            }
          />
        </SheetTable>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total leads"
              icon="users-group-rounded"
              value={stats.total}
              sub="Every lead in the tracker"
              loading={loading}
            />
            <StatCard
              label="Open leads"
              icon="clock-circle"
              value={stats.open}
              sub="New, Contacted, Qualified and Proposal"
              loading={loading}
            />
            <StatCard
              label="Won, est. value"
              icon="check-circle"
              value={formatMoney(stats.wonEstimate)}
              sub="Estimate from Closed Won deals"
              loading={loading}
            />
            <StatCard
              label="Est. pipeline value"
              icon="wallet-money"
              value={formatMoney(stats.pipelineEstimate)}
              sub="Estimate from open leads"
              loading={loading}
            />
          </div>

          <SheetTable
            title="Leads by status"
            description="Share of all leads at each stage"
          >
            <ul className="divide-y divide-gray-100">
              {stats.byStatus.map(({ status, count }) => {
                const share = stats.total ? (count / stats.total) * 100 : 0
                return (
                  <li key={status} className="space-y-2 px-4 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <Pill tone={STATUS_TONE[status]}>{status}</Pill>
                      {loading ? (
                        <Skeleton className="h-4 w-16" />
                      ) : (
                        <span className="text-sm tabular-nums text-gray-500">
                          {count} {count === 1 ? 'lead' : 'leads'}
                        </span>
                      )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className={cn('h-full rounded-full', BAR[STATUS_TONE[status]])}
                        initial={{ width: reduce ? `${share}%` : 0 }}
                        animate={{ width: `${share}%` }}
                        transition={{ duration: reduce ? 0 : 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </SheetTable>
        </div>
      )}
    </>
  )
}
