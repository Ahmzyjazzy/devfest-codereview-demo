import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { api, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { CloseButton } from '@/components/ui/close-button'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

type Kind = 'insights' | 'research'

const SOURCE_LINE = /^- (.+?): (https?:\/\/\S+)$/

const LABEL: Record<Kind, string> = {
  insights: 'AI insights',
  research: 'Lead research',
}

export function AiPanel({
  leadId,
  onNoteAdded,
}: {
  leadId: number
  onNoteAdded: () => void
}) {
  const [pending, setPending] = useState<Kind | null>(null)
  const [result, setResult] = useState<{ kind: Kind; text: string } | null>(null)
  const [notConfigured, setNotConfigured] = useState(false)

  useEffect(() => {
    setResult(null)
    setPending(null)
  }, [leadId])

  const run = async (kind: Kind) => {
    setPending(kind)
    setResult(null)
    try {
      const res =
        kind === 'insights'
          ? await api.leadInsights(leadId)
          : await api.leadResearch(leadId)
      setResult({ kind, text: res.text })
      onNoteAdded()
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setNotConfigured(true)
      } else {
        toast.error(`${LABEL[kind]} failed. Try again.`)
      }
    } finally {
      setPending(null)
    }
  }

  return (
    <section aria-labelledby="ai-heading" className="space-y-3">
      <h3 id="ai-heading" className="text-sm font-medium text-gray-900">
        AI assistant
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => run('insights')}
          disabled={pending !== null}
        >
          <Icon name="stars" size={16} className="text-primary" />
          AI insights
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => run('research')}
          disabled={pending !== null}
        >
          <Icon name="global" size={16} className="text-emerald-600" />
          Research lead
        </Button>
      </div>

      {notConfigured && (
        <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-amber-200">
          AI is not set up. Add <code className="font-mono">GEMINI_API_KEY</code>{' '}
          to <code className="font-mono">.env</code> and restart{' '}
          <code className="font-mono">npm run dev</code>.
        </p>
      )}

      {pending && (
        <div className="space-y-2 rounded-xl bg-gray-50 p-3" aria-live="polite">
          <p className="text-xs text-gray-500">
            {pending === 'research'
              ? 'Searching the web for this lead…'
              : 'Analysing this lead…'}
          </p>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {result && (
        <div className="relative rounded-xl bg-gray-50 p-3 pr-12">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-900">
            <Icon
              name={result.kind === 'research' ? 'global' : 'stars'}
              active
              size={16}
              className={result.kind === 'research' ? 'text-emerald-600' : 'text-primary'}
            />
            {LABEL[result.kind]}
          </p>
          <div className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
            {result.text.split('\n').map((line, i) => {
              const source = line.match(SOURCE_LINE)
              if (!source) return <p key={i}>{line || '\u00a0'}</p>
              return (
                <p key={i}>
                  -{' '}
                  <a
                    href={source[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {source[1]}
                  </a>
                </p>
              )
            })}
          </div>
          <CloseButton
            iconSize={16}
            className="absolute right-2 top-2 size-7"
            aria-label={`Close ${LABEL[result.kind]}`}
            onClick={() => setResult(null)}
          />
        </div>
      )}
    </section>
  )
}
