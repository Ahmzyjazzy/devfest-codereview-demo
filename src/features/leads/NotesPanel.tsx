import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Pill } from '@/components/ui/list-kit'
import { Skeleton } from '@/components/ui/skeleton'
import { daysAgo } from '@/lib/format'
import type { LeadNote } from '@/types'

export function NotesPanel({
  notes,
  loading,
  onAdd,
}: {
  notes: LeadNote[]
  loading: boolean
  onAdd: (content: string) => Promise<void>
}) {
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setSaving(true)
    try {
      await onAdd(content)
      setDraft('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="notes-heading" className="space-y-3">
      <h3 id="notes-heading" className="text-sm font-medium text-gray-900">
        Notes log
      </h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          aria-label="New note"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a note about this lead"
          className="min-h-16"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={saving || !draft.trim()}>
            Add note
          </Button>
        </div>
      </form>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : notes.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
          No notes yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map(note => (
            <li key={note.id} className="rounded-xl bg-gray-50 px-3 py-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Pill tone={note.type === 'meeting' ? 'violet' : 'gray'} dot={false}>
                  {note.type === 'meeting' ? 'Meeting' : 'Note'}
                </Pill>
                <span className="text-xs text-gray-500">
                  {daysAgo(note.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {note.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
