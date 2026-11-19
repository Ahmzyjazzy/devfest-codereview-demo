import { useEffect, useState, type FormEvent } from 'react'

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
import { STATUS_OPTIONS, type Lead, type LeadInput, type LeadStatus } from '@/types'

const EMPTY: LeadInput = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'New',
  value: 0,
  notes: '',
}

export function toE164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`
  if (/^234\d{10}$/.test(digits)) return `+${digits}`
  return digits
}

function fromLead(lead: Lead): LeadInput {
  return {
    name: lead.name,
    company: lead.company ?? '',
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    status: lead.status,
    value: lead.value,
    notes: lead.notes ?? '',
  }
}

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onSubmit: (input: LeadInput) => Promise<void>
}) {
  const [form, setForm] = useState<LeadInput>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(lead ? fromLead(lead) : EMPTY)
  }, [open, lead])

  const set = <K extends keyof LeadInput>(key: K, value: LeadInput[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ ...form, phone: toE164(form.phone) })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit lead' : 'Add lead'}</DialogTitle>
          <DialogDescription>
            {lead
              ? 'Update the contact details or the deal estimate.'
              : 'Add a business you are pitching to.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="lead-name">Contact name</Label>
              <Input
                id="lead-name"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Adebola Ogunleye"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-company">Business</Label>
              <Input
                id="lead-company"
                value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="Bodija Grand Hotel"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="name@business.ng"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="0803 123 4567"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={v => set('status', v as LeadStatus)}
              >
                <SelectTrigger id="lead-status">
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
            <div className="grid gap-1.5">
              <Label htmlFor="lead-value">Est. deal value (₦)</Label>
              <Input
                id="lead-value"
                type="number"
                min={0}
                step={1000}
                value={form.value || ''}
                onChange={e => set('value', Number(e.target.value) || 0)}
                placeholder="500000"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea
              id="lead-notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="What do they need?"
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
              {lead ? 'Save changes' : 'Add lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
