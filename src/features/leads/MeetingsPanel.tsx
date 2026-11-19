import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Pill, RowMenuTrigger } from '@/components/ui/list-kit'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import type { Meeting } from '@/types'

export function MeetingsPanel({
  meetings,
  loading,
  onAdd,
  onEdit,
  onToggleComplete,
  onDelete,
}: {
  meetings: Meeting[]
  loading: boolean
  onAdd: () => void
  onEdit: (meeting: Meeting) => void
  onToggleComplete: (meeting: Meeting) => void
  onDelete: (meeting: Meeting) => void
}) {
  return (
    <section aria-labelledby="meetings-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id="meetings-heading" className="text-sm font-medium text-gray-900">
          Meetings
        </h3>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Icon name="calendar-add" size={16} />
          Schedule
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : meetings.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
          No meetings scheduled.
        </p>
      ) : (
        <ul className="space-y-2">
          {meetings.map(m => {
            const done = Boolean(m.is_completed)
            return (
              <li
                key={m.id}
                className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => onToggleComplete(m)}
                  aria-label={done ? 'Mark as not done' : 'Mark as complete'}
                  aria-pressed={done}
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors',
                    done
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-gray-400 hover:bg-gray-200/70 hover:text-gray-700',
                  )}
                >
                  <Icon name="check-circle" active={done} size={20} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        'text-sm font-medium text-gray-900',
                        done && 'text-gray-500 line-through',
                      )}
                    >
                      {m.title}
                    </p>
                    {done && (
                      <Pill tone="green" dot={false}>
                        Done
                      </Pill>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Icon name="calendar" size={14} />
                    {formatDateTime(m.meeting_date)}
                  </p>
                  {m.notes && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                      {m.notes}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <RowMenuTrigger aria-label={`Actions for ${m.title}`} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(m)}>
                      <Icon name="pen" size={16} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onSelect={() => onDelete(m)}>
                      <Icon name="trash-bin-trash" size={16} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
