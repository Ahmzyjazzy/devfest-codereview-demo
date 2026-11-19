import type {
  Lead,
  LeadInput,
  LeadNote,
  Meeting,
  MeetingInput,
} from '@/types'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export interface ChatTurn {
  role: 'user' | 'model'
  text: string
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status)
  }
  return body as T
}

const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
})

export const api = {
  listLeads: () => request<Lead[]>('/api/leads'),
  createLead: (input: LeadInput) =>
    request<Lead>('/api/leads', send('POST', input)),
  updateLead: (id: number, input: LeadInput) =>
    request<Lead>(`/api/leads/${id}`, send('PUT', input)),
  deleteLead: (id: number) =>
    request<{ success: boolean }>(`/api/leads/${id}`, send('DELETE')),

  listNotes: (leadId: number) =>
    request<LeadNote[]>(`/api/leads/${leadId}/notes`),
  addNote: (leadId: number, content: string) =>
    request<LeadNote>(
      `/api/leads/${leadId}/notes`,
      send('POST', { content, type: 'general' }),
    ),

  listMeetings: () => request<Meeting[]>('/api/meetings'),
  createMeeting: (input: MeetingInput) =>
    request<Meeting>('/api/meetings', send('POST', input)),
  updateMeeting: (
    id: number,
    input: Omit<MeetingInput, 'lead_id'> & { is_completed: boolean },
  ) => request<Meeting>(`/api/meetings/${id}`, send('PUT', input)),
  deleteMeeting: (id: number) =>
    request<{ success: boolean }>(`/api/meetings/${id}`, send('DELETE')),

  leadInsights: (leadId: number) =>
    request<{ text: string; note: LeadNote }>(
      `/api/leads/${leadId}/insights`,
      send('POST'),
    ),
  leadResearch: (leadId: number) =>
    request<{ text: string; note: LeadNote }>(
      `/api/leads/${leadId}/research`,
      send('POST'),
    ),

  chat: (message: string, history: ChatTurn[]) =>
    request<{ text: string }>('/api/chat', send('POST', { message, history })),
}
