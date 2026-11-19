import type { PillTone } from '@/components/ui/list-kit'

export const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Closed Won',
  'Closed Lost',
] as const

export type LeadStatus = (typeof STATUS_OPTIONS)[number]

export const OPEN_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
]

export const STATUS_TONE: Record<LeadStatus, PillTone> = {
  New: 'gray',
  Contacted: 'blue',
  Qualified: 'violet',
  Proposal: 'amber',
  'Closed Won': 'green',
  'Closed Lost': 'red',
}

export interface Lead {
  id: number
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: LeadStatus
  value: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: number
  lead_id: number
  lead_name: string
  lead_company: string
  title: string
  meeting_date: string
  notes: string
  is_completed: number
  created_at: string
}

export interface LeadNote {
  id: number
  lead_id: number
  content: string
  type: 'general' | 'meeting' | 'analysis' | 'research'
  created_at: string
}

export interface LeadInput {
  name: string
  company: string
  email: string
  phone: string
  status: LeadStatus
  value: number
  notes: string
}

export interface MeetingInput {
  lead_id: number
  title: string
  meeting_date: string
  notes: string
}
