import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { toast } from 'sonner'

import { api, ApiError, type ChatTurn } from '@/lib/api'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/icon'
import { PageHeader } from '@/components/ui/page-header'

const GREETING: ChatTurn = {
  role: 'model',
  text: 'Hello! I can see Ade’s Kitchen’s leads and meetings. Ask me which leads to follow up, what is coming up this week, or how the pipeline looks.',
}

const MAX_HISTORY = 20

export function ChatPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending])

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || pending) return

    const history = messages.slice(1).slice(-MAX_HISTORY)
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setPending(true)
    try {
      const reply = await api.chat(text, history)
      setMessages(m => [...m, { role: 'model', text: reply.text || 'No reply.' }])
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setNotConfigured(true)
      } else {
        toast.error('The assistant could not answer. Try again.')
      }
      setMessages(m => m.slice(0, -1))
      setInput(text)
    } finally {
      setPending(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <PageHeader
        title="Chat"
        subtitle="Ask the assistant about your leads, meetings and pipeline."
      />

      {notConfigured && (
        <div
          role="status"
          className="mb-4 flex gap-3 rounded-sheet bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
        >
          <Icon name="danger-triangle" size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Chat is not set up yet</p>
            <p className="mt-0.5">
              Copy <code className="font-mono">.env.example</code> to{' '}
              <code className="font-mono">.env</code>, add your{' '}
              <code className="font-mono">GEMINI_API_KEY</code>, then restart{' '}
              <code className="font-mono">npm run dev</code>. The rest of the
              app works without it.
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex min-h-96 flex-col rounded-well bg-gray-100 p-1',
          notConfigured ? 'h-[calc(100dvh-21rem)]' : 'h-[calc(100dvh-16rem)]',
        )}
      >
        <div
          ref={scrollRef}
          aria-live="polite"
          className="flex-1 space-y-3 overflow-y-auto rounded-sheet bg-surface p-4 ring-1 ring-hairline/[0.04] sm:p-6"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <p
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 sm:max-w-[70%]',
                  m.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900',
                )}
              >
                {m.text}
              </p>
            </div>
          ))}
          {pending && (
            <div className="flex justify-start">
              <p className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">
                <span className="sr-only">Assistant is typing</span>
                {[0, 1, 2].map(d => (
                  <span
                    key={d}
                    className="size-1.5 animate-pulse rounded-full bg-gray-400"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={send} className="flex items-end gap-2 p-2">
          <textarea
            aria-label="Message"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={2000}
            placeholder="Ask about your leads…"
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl bg-surface px-3.5 py-2.5 text-sm text-gray-900 ring-1 ring-hairline/[0.06] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || pending}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <Icon name="plane" active size={18} />
          </button>
        </form>
      </div>
    </>
  )
}
