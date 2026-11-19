import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { daysAgo, formatMoney, formatPhoneForDisplay } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Icon, type IconName } from '@/components/ui/icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  STATUS_OPTIONS,
  type Lead,
  type LeadInput,
  type LeadNote,
  type LeadStatus,
  type Meeting,
} from '@/types'
import { AiPanel } from './AiPanel'
import { MeetingFormDialog, type MeetingFormValues } from './MeetingFormDialog'
import { MeetingsPanel } from './MeetingsPanel'
import { NotesPanel } from './NotesPanel'

function toInput(lead: Lead, status: LeadStatus): LeadInput {
  return {
    name: lead.name,
    company: lead.company ?? '',
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    status,
    value: lead.value,
    notes: lead.notes ?? '',
  }
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: IconName
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5">
      <Icon name={icon} size={18} className="mt-0.5 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="truncate text-sm text-gray-900">{children}</div>
      </div>
    </div>
  )
}

export function LeadDetailSheet({
  lead,
  onOpenChange,
  onLeadChange,
  onEdit,
  onDelete,
}: {
  lead: Lead | null
  onOpenChange: (open: boolean) => void
  onLeadChange: (lead: Lead) => void
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
}) {
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)
  const [meetingForm, setMeetingForm] = useState<{
    open: boolean
    meeting: Meeting | null
  }>({ open: false, meeting: null })
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null)

  const leadId = lead?.id
  const updatedAt = lead?.updated_at

  const refresh = useCallback(async (id: number) => {
    const [n, m] = await Promise.all([api.listNotes(id), api.listMeetings()])
    setNotes(n)
    setMeetings(m.filter(x => x.lead_id === id))
  }, [])

  useEffect(() => {
    if (leadId == null) return
    setLoading(true)
    setNotes([])
    setMeetings([])
    refresh(leadId)
      .catch(() => toast.error('Could not load notes and meetings'))
      .finally(() => setLoading(false))
  }, [leadId, refresh])

  useEffect(() => {
    if (leadId != null && updatedAt) refresh(leadId).catch(() => undefined)
  }, [leadId, updatedAt, refresh])

  const run = async (action: () => Promise<unknown>, success: string) => {
    if (!lead) return
    try {
      await action()
      await refresh(lead.id)
      toast.success(success)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
      throw e
    }
  }

  const changeStatus = async (status: LeadStatus) => {
    if (!lead || status === lead.status) return
    try {
      onLeadChange(await api.updateLead(lead.id, toInput(lead, status)))
      toast.success(`Status changed to ${status}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change status')
    }
  }

  const saveMeeting = (values: MeetingFormValues) => {
    const editing = meetingForm.meeting
    return run(
      () =>
        editing
          ? api.updateMeeting(editing.id, {
              ...values,
              is_completed: Boolean(editing.is_completed),
            })
          : api.createMeeting({ ...values, lead_id: lead!.id }),
      editing ? 'Meeting updated' : 'Meeting scheduled',
    )
  }

  const toggleMeeting = (m: Meeting) =>
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

  return (
    <>
      <Sheet open={lead !== null} onOpenChange={onOpenChange}>
        <SheetContent className="gap-0 p-0">
          {lead && (
            <>
              <SheetHeader className="px-6 pb-4 pt-5">
                <SheetTitle>{lead.name}</SheetTitle>
                <SheetDescription>
                  {lead.company || 'No business name'} · updated{' '}
                  {daysAgo(lead.updated_at).toLowerCase()}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="detail-status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <Select
                    value={lead.status}
                    onValueChange={v => changeStatus(v as LeadStatus)}
                  >
                    <SelectTrigger id="detail-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="divide-y divide-gray-100 rounded-sheet ring-1 ring-hairline/[0.06]">
                  <DetailRow icon="wallet-money" label="Est. deal value">
                    <span className="tabular-nums">{formatMoney(lead.value)}</span>
                  </DetailRow>
                  <DetailRow icon="phone" label="Phone">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="hover:underline">
                        {formatPhoneForDisplay(lead.phone)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </DetailRow>
                  <DetailRow icon="letter" label="Email">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="hover:underline">
                        {lead.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </DetailRow>
                  <DetailRow icon="clock-circle" label="Added">
                    {daysAgo(lead.created_at)}
                  </DetailRow>
                </div>

                <AiPanel
                  leadId={lead.id}
                  onNoteAdded={() => refresh(lead.id).catch(() => undefined)}
                />

                <MeetingsPanel
                  meetings={meetings}
                  loading={loading}
                  onAdd={() => setMeetingForm({ open: true, meeting: null })}
                  onEdit={m => setMeetingForm({ open: true, meeting: m })}
                  onToggleComplete={toggleMeeting}
                  onDelete={setDeletingMeeting}
                />

                <NotesPanel
                  notes={notes}
                  loading={loading}
                  onAdd={content =>
                    run(() => api.addNote(lead.id, content), 'Note added')
                  }
                />
              </div>

              <SheetFooter className="border-t border-gray-100 px-6 py-4">
                <Button variant="outline" onClick={() => onDelete(lead)}>
                  <Icon name="trash-bin-trash" size={16} />
                  Delete
                </Button>
                <Button onClick={() => onEdit(lead)}>
                  <Icon name="pen" size={16} />
                  Edit lead
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <MeetingFormDialog
        open={meetingForm.open}
        onOpenChange={open => setMeetingForm(f => ({ ...f, open }))}
        meeting={meetingForm.meeting}
        leadName={lead?.name ?? ''}
        onSubmit={saveMeeting}
      />

      <ConfirmDialog
        open={deletingMeeting !== null}
        onOpenChange={open => !open && setDeletingMeeting(null)}
        variant="destructive"
        title="Delete this meeting?"
        description={`“${deletingMeeting?.title ?? ''}” will be removed.`}
        confirmLabel="Delete meeting"
        onConfirm={() =>
          run(() => api.deleteMeeting(deletingMeeting!.id), 'Meeting deleted')
        }
      />
    </>
  )
}
