import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { daysAgo, formatMoney, formatPhoneForDisplay } from '@/lib/format'
import { CountTabs, type CountTab } from '@/components/ui/count-tabs'
import { ConfirmDialog } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import {
  EmptyRows,
  Pill,
  PrimaryButton,
  QuietButton,
  RowMenuTrigger,
  SearchField,
  SheetPager,
  SheetTable,
} from '@/components/ui/list-kit'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  STATUS_OPTIONS,
  STATUS_TONE,
  type Lead,
  type LeadInput,
  type LeadStatus,
} from '@/types'
import { LeadDetailSheet } from './LeadDetailSheet'
import { LeadFormDialog } from './LeadFormDialog'

const PAGE_SIZE = 10

type Tab = 'All' | LeadStatus

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('')
}

function matches(lead: Lead, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const digits = q.replace(/\D/g, '')
  return (
    lead.name.toLowerCase().includes(q) ||
    (lead.company ?? '').toLowerCase().includes(q) ||
    (lead.email ?? '').toLowerCase().includes(q) ||
    (digits.length > 2 && (lead.phone ?? '').replace(/\D/g, '').includes(digits))
  )
}

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('All')
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState<Lead | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = leads.find(l => l.id === selectedId) ?? null

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

  useEffect(() => setPage(0), [search, tab])

  const searched = useMemo(
    () => leads.filter(l => matches(l, search)),
    [leads, search],
  )

  const tabs: CountTab<Tab>[] = useMemo(
    () => [
      { key: 'All', label: 'All', count: searched.length },
      ...STATUS_OPTIONS.map(s => ({
        key: s,
        label: s,
        count: searched.filter(l => l.status === s).length,
      })),
    ],
    [searched],
  )

  const visible = useMemo(
    () => (tab === 'All' ? searched : searched.filter(l => l.status === tab)),
    [searched, tab],
  )
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (lead: Lead) => {
    setEditing(lead)
    setFormOpen(true)
  }

  const saveLead = async (input: LeadInput) => {
    try {
      if (editing) {
        const updated = await api.updateLead(editing.id, input)
        setLeads(ls => ls.map(l => (l.id === updated.id ? updated : l)))
        toast.success('Lead updated')
      } else {
        const created = await api.createLead(input)
        setLeads(ls => [created, ...ls])
        toast.success('Lead added')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save lead')
      throw e
    }
  }

  const deleteLead = async () => {
    if (!deleting) return
    try {
      await api.deleteLead(deleting.id)
      setLeads(ls => ls.filter(l => l.id !== deleting.id))
      if (selectedId === deleting.id) setSelectedId(null)
      toast.success('Lead deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete lead')
      throw e
    }
  }

  const hasLeads = leads.length > 0

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Businesses Ade’s Kitchen is pitching catering to."
        actions={<PrimaryButton onClick={openAdd}>Add lead</PrimaryButton>}
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name, business, email or phone"
            className="sm:max-w-sm"
          />
          <CountTabs
            label="Filter by status"
            tabs={tabs}
            value={tab}
            onChange={setTab}
          />
        </div>

        {error ? (
          <SheetTable>
            <EmptyRows
              icon="danger-triangle"
              title="Could not load leads"
              body={error}
              action={
                <QuietButton icon="refresh" onClick={load}>
                  Try again
                </QuietButton>
              }
            />
          </SheetTable>
        ) : loading ? (
          <SheetTable>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <Skeleton className="size-9 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </SheetTable>
        ) : visible.length === 0 ? (
          <SheetTable>
            {hasLeads ? (
              <EmptyRows
                title="No leads match"
                body="Try a different name, business, email or phone number."
              />
            ) : (
              <EmptyRows
                icon="users-group-rounded"
                title="No leads yet"
                body="Add the first business you are pitching to."
                action={<PrimaryButton onClick={openAdd}>Add lead</PrimaryButton>}
              />
            )}
          </SheetTable>
        ) : (
          <SheetTable
            footer={
              <SheetPager
                page={page}
                pageSize={PAGE_SIZE}
                total={visible.length}
                onPageChange={setPage}
              />
            }
          >
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th className="max-md:hidden">Phone</th>
                  <th>Status</th>
                  <th className="text-right">Est. value</th>
                  <th className="max-lg:hidden">Last updated</th>
                  <th className="w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedId(lead.id)}
                    className="cursor-pointer"
                  >
                    <td>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedId(lead.id)
                        }}
                        aria-label={`Open ${lead.name}`}
                        className="flex items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary">
                          {initials(lead.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {lead.name}
                          </p>
                          <p className="truncate text-[13px] text-gray-500">
                            {lead.company || 'No business name'}
                          </p>
                        </div>
                      </button>
                    </td>
                    <td className="whitespace-nowrap text-gray-600 tabular-nums max-md:hidden">
                      {formatPhoneForDisplay(lead.phone) || '—'}
                    </td>
                    <td>
                      <Pill tone={STATUS_TONE[lead.status] ?? 'gray'}>
                        {lead.status}
                      </Pill>
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums text-gray-900">
                      {formatMoney(lead.value)}
                    </td>
                    <td className="whitespace-nowrap text-gray-500 max-lg:hidden">
                      {daysAgo(lead.updated_at)}
                    </td>
                    <td className="text-right" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <RowMenuTrigger aria-label={`Actions for ${lead.name}`} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setSelectedId(lead.id)}>
                            <Icon name="notes" size={16} />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openEdit(lead)}>
                            <Icon name="pen" size={16} />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            destructive
                            onSelect={() => setDeleting(lead)}
                          >
                            <Icon name="trash-bin-trash" size={16} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SheetTable>
        )}
      </div>

      <LeadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editing}
        onSubmit={saveLead}
      />

      <LeadDetailSheet
        lead={selected}
        onOpenChange={open => !open && setSelectedId(null)}
        onLeadChange={updated =>
          setLeads(ls => ls.map(l => (l.id === updated.id ? updated : l)))
        }
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={open => !open && setDeleting(null)}
        variant="destructive"
        title="Delete this lead?"
        description={`${deleting?.name ?? 'This lead'} and their notes and meetings will be removed. This cannot be undone.`}
        confirmLabel="Delete lead"
        onConfirm={deleteLead}
      />
    </>
  )
}
