import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/cn'

export interface CountTab<K extends string> {
  key: K
  label: string
  count: number
  warn?: boolean
}

export function CountTabs<K extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: CountTab<K>[]
  value: K
  onChange: (key: K) => void
  label: string
}) {
  const reduce = useReducedMotion()
  const thumb = useId()
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-0.5 overflow-x-auto rounded-sheet bg-gray-200/70 p-1 [scrollbar-width:none]"
    >
      {tabs.map(t => {
        const on = t.key === value
        const warn = t.warn && t.count > 0
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={`${t.label}, ${t.count}`}
            onClick={() => onChange(t.key)}
            className={cn(
              'relative flex h-9 min-w-max flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors',
              on ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900',
            )}
          >
            {on && (
              <motion.span
                layoutId={thumb}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 38 }
                }
                className="absolute inset-0 rounded-[10px] bg-surface ring-1 ring-hairline/[0.06]"
              />
            )}
            <span className="relative">{t.label}</span>
            <span
              className={cn(
                'relative min-w-5 shrink-0 rounded-full px-1.5 py-px text-[11px] tabular-nums',
                warn
                  ? 'bg-amber-100 text-amber-700'
                  : on
                    ? 'bg-gray-900 text-surface'
                    : 'bg-surface/70 text-gray-500',
              )}
            >
              {t.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
