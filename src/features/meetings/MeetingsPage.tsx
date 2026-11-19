import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { formatDateTime, parseDbDate } from '@/lib/format'
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
  type PillTone,
} from '@/components/ui/list-kit'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { LeadDetailSheet } from '@/features/leads/LeadDetailSheet'
import { LeadFormDialog } from '@/features/leads/LeadFormDialog'
import {
  MeetingFormDialog,
  type MeetingFormValues,
} from '@/features/leads/MeetingFormDialog'
import type { Lead, LeadInput, Meeting } from '@/types'

const PAGE_SIZE = 10

type Tab = 'upcoming' | 'overdue' | 'completed' | 'all'
type MeetingState = 'upcoming' | 'overdue' | 'completed'

const STATE_PILL: Record<MeetingState, [string, PillTone]> = {
  upcoming: ['Upcoming', 'blue'],
  overdue: ['Overdue', 'red'],
  completed: ['Done', 'green'],
}

function stateOf(m: Meeting, now: number): MeetingState {
  if (m.is_completed) return 'completed'
  return parseDbDate(m.meeting_date).getTime() < now ? 'overdue' : 'upcoming'
}

function matches(m: Meeting, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [m.title, m.lead_name, m.lead_company]
    .filter(Boolean)
    .some(v => v.toLowerCase().includes(q))
}

export function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('upcoming')
  const [page, setPage] = useState(0)
  const [form, setForm] = useState<{ open: boolean; meeting: Meeting | null }>({
    open: false,
    meeting: null,
  })
  const [deleting, setDeleting] = useState<Meeting | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    setError(null)
    try {
      const [m, l] = await Promise.all([api.listMeetings(), api.listLeads()])
      setMeetings(m)
      setLeads(l)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load meetings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => setPage(0), [search, tab])

  const now = Date.now()
  const searched = useMemo(
    () => meetings.filter(m => matches(m, search)),
    [meetings, search],
  )
  const count = (s: MeetingState) =>
    searched.filter(m => stateOf(m, now) === s).length

  const tabs: CountTab<Tab>[] = [
    { key: 'upcoming', label: 'Upcoming', count: count('upcoming') },
    { key: 'overdue', label: 'Overdue', count: count('overdue'), warn: true },
    { key: 'completed', label: 'Completed', count: count('completed') },
    { key: 'all', label: 'All', count: searched.length },
  ]

  const visible = useMemo(() => {
    const rows =
      tab === 'all' ? searched : searched.filter(m => stateOf(m, now) === tab)
    return tab === 'completed' ? [...rows].reverse() : rows
  }, [searched, tab, now])
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      await load(true)
      toast.success(success)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
      throw e
    }
  }

  const saveMeeting = (values: MeetingFormValues) => {
    const editing = form.meeting
    return run(
      () =>
        editing
          ? api.updateMeeting(editing.id, {
              title: values.title,
              meeting_date: values.meeting_date,
              notes: values.notes,
              is_completed: Boolean(editing.is_completed),
            })
          : api.createMeeting({
              lead_id: values.lead_id!,
              title: values.title,
              meeting_date: values.meeting_date,
              notes: values.notes,
            }),
      editing ? 'Meeting updated' : 'Meeting scheduled',
    )
  }

  const toggle = (m: Meeting) =>
    run(
      () =>
        api.updateMeeting(m.id, {
          title: m.title,
          meeting_date: m.meeting_date,
          notes: m.notes,
          is_completed: !m.is_completed,
        }),
      m.is_completed ? 'Meeting reopened' : 'Meeting marked complete',
    ).catch(() => undefined)

  const saveLead = async (input: LeadInput) => {
    if (!editingLead) return
    await run(() => api.updateLead(editingLead.id, input), 'Lead updated')
  }

  const selectedLead = leads.find(l => l.id === selectedLeadId) ?? null

  const emptyState =
    meetings.length === 0 ? (
      <EmptyRows
        icon="calendar"
        title="No meetings yet"
        body="Schedule your first tasting, site visit or pitch."
        action={
          <PrimaryButton onClick={() => setForm({ open: true, meeting: null })}>
            Schedule meeting
          </PrimaryButton>
        }
      />
    ) : search.trim() ? (
      <EmptyRows
        title="No meetings match"
        body="Try a different title, lead or business name."
      />
    ) : (
      <EmptyRows icon="calendar" title="Nothing in this tab" />
    )

  return (
    <>
      <PageHeader
        title="Meetings"
        subtitle="Tastings, site visits and pitches with your leads."
        actions={
          <PrimaryButton
            icon="calendar-add"
            onClick={() => setForm({ open: true, meeting: null })}
          >
            Schedule meeting
          </PrimaryButton>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by title, lead or business"
            className="sm:max-w-sm"
          />
          <CountTabs
            label="Filter meetings"
            tabs={tabs}
            value={tab}
            onChange={setTab}
          />
        </div>

        {error ? (
          <SheetTable>
            <EmptyRows
              icon="danger-triangle"
              title="Could not load meetings"
              body={error}
              action={
                <QuietButton icon="refresh" onClick={() => load()}>
                  Try again
                </QuietButton>
              }
            />
          </SheetTable>
        ) : loading ? (
          <SheetTable>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </SheetTable>
        ) : visible.length === 0 ? (
          <SheetTable>{emptyState}</SheetTable>
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
                  <th>Meeting</th>
                  <th className="max-md:hidden">Lead</th>
                  <th>When</th>
                  <th>State</th>
                  <th className="w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(m => {
                  const state = stateOf(m, now)
                  const [label, tone] = STATE_PILL[state]
                  return (
                    <tr key={m.id}>
                      <td>
                        <p className="font-medium text-gray-900">{m.title}</p>
                        {m.notes && (
                          <p className="max-w-xs truncate text-[13px] text-gray-500">
                            {m.notes}
                          </p>
                        )}
                      </td>
                      <td className="max-md:hidden">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadId(m.lead_id)}
                          aria-label={`Open ${m.lead_name}`}
                          className="rounded-lg text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gray-400"
                        >
                          <p className="text-gray-900">{m.lead_name}</p>
                          <p className="text-[13px] text-gray-500">
                            {m.lead_company}
                          </p>
                        </button>
                      </td>
                      <td className="whitespace-nowrap text-gray-600">
                        {formatDateTime(m.meeting_date)}
                      </td>
                      <td>
                        <Pill tone={tone}>{label}</Pill>
                      </td>
                      <td className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <RowMenuTrigger aria-label={`Actions for ${m.title}`} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => setSelectedLeadId(m.lead_id)}
                            >
                              <Icon name="user-circle" size={16} />
                              View lead
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setForm({ open: true, meeting: m })}
                            >
                              <Icon name="pen" size={16} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toggle(m)}>
                              <Icon name="check-circle" size={16} />
                              {m.is_completed ? 'Reopen' : 'Mark complete'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              destructive
                              onSelect={() => setDeleting(m)}
                            >
                              <Icon name="trash-bin-trash" size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </SheetTable>
        )}
      </div>

      <MeetingFormDialog
        open={form.open}
        onOpenChange={open => setForm(f => ({ ...f, open }))}
        meeting={form.meeting}
        leads={leads}
        onSubmit={saveMeeting}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={open => !open && setDeleting(null)}
        variant="destructive"
        title="Delete this meeting?"
        description={`“${deleting?.title ?? ''}” will be removed.`}
        confirmLabel="Delete meeting"
        onConfirm={() =>
          run(() => api.deleteMeeting(deleting!.id), 'Meeting deleted')
        }
      />

      <LeadDetailSheet
        lead={selectedLead}
        onOpenChange={open => {
          if (open) return
          setSelectedLeadId(null)
          load(true)
        }}
        onLeadChange={updated =>
          setLeads(ls => ls.map(l => (l.id === updated.id ? updated : l)))
        }
        onEdit={setEditingLead}
        onDelete={setDeletingLead}
      />

      <LeadFormDialog
        open={editingLead !== null}
        onOpenChange={open => !open && setEditingLead(null)}
        lead={editingLead}
        onSubmit={saveLead}
      />

      <ConfirmDialog
        open={deletingLead !== null}
        onOpenChange={open => !open && setDeletingLead(null)}
        variant="destructive"
        title="Delete this lead?"
        description={`${deletingLead?.name ?? 'This lead'} and their notes and meetings will be removed. This cannot be undone.`}
        confirmLabel="Delete lead"
        onConfirm={async () => {
          await run(() => api.deleteLead(deletingLead!.id), 'Lead deleted')
          setSelectedLeadId(null)
        }}
      />
    </>
  )
}
