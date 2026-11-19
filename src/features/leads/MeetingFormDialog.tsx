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
import { parseDbDate } from '@/lib/format'
import type { Meeting } from '@/types'

export interface MeetingFormValues {
  title: string
  meeting_date: string
  notes: string
}

function toLocalInput(value: string) {
  return format(parseDbDate(value), "yyyy-MM-dd'T'HH:mm")
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  meeting,
  leadName,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
  leadName: string
  onSubmit: (values: MeetingFormValues) => Promise<void>
}) {
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
          <DialogDescription>With {leadName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <Button type="submit" disabled={saving}>
              {meeting ? 'Save meeting' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
