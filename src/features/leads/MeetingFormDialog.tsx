import { useEffect, useState, type FormEvent } from 'react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parseDbDate } from '@/lib/format'
import type { Lead, Meeting } from '@/types'

export interface MeetingFormValues {
  title: string
  meeting_date: string
  notes: string
  lead_id?: number
}

function toLocalInput(value: string) {
  return format(parseDbDate(value), "yyyy-MM-dd'T'HH:mm")
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  meeting,
  leadName,
  leads,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
  leadName?: string
  leads?: Lead[]
  onSubmit: (values: MeetingFormValues) => Promise<void>
}) {
  const pickLead = Boolean(leads) && !meeting
  const [form, setForm] = useState<MeetingFormValues>({
    title: '',
    meeting_date: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      meeting
        ? {
            title: meeting.title,
            meeting_date: toLocalInput(meeting.meeting_date),
            notes: meeting.notes ?? '',
            lead_id: meeting.lead_id,
          }
        : { title: '', meeting_date: '', notes: '' },
    )
  }, [open, meeting])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meeting ? 'Edit meeting' : 'Schedule meeting'}</DialogTitle>
          <DialogDescription>
            {pickLead
              ? 'Pick the lead and when you are meeting them.'
              : `With ${meeting?.lead_name ?? leadName ?? 'this lead'}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {pickLead && (
            <div className="grid gap-1.5">
              <Label htmlFor="meeting-lead">Lead</Label>
              <Select
                required
                value={form.lead_id ? String(form.lead_id) : ''}
                onValueChange={v => setForm(f => ({ ...f, lead_id: Number(v) }))}
              >
                <SelectTrigger id="meeting-lead">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {leads!.map(l => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                      {l.company ? ` · ${l.company}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="meeting-title">Title</Label>
            <Input
              id="meeting-title"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Menu tasting"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="meeting-date">Date and time</Label>
            <Input
              id="meeting-date"
              type="datetime-local"
              required
              value={form.meeting_date}
              onChange={e =>
                setForm(f => ({ ...f, meeting_date: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="meeting-notes">Notes</Label>
            <Textarea
              id="meeting-notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Agenda, who is attending, what to bring"
            />
          </div>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || (pickLead && !form.lead_id)}>
              {meeting ? 'Save meeting' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
