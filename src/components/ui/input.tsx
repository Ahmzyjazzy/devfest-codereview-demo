import * as React from 'react'

import { cn } from '@/lib/cn'

const FIELD =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base text-gray-900 transition-colors placeholder:text-gray-400 focus-visible:border-gray-300 focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-900/[0.04] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, onWheel, ...props }, ref) => (
    <input
      type={type}
      onWheel={e => {
        if (type === 'number') e.currentTarget.blur()
        onWheel?.(e)
      }}
      className={cn('flex h-10 py-1', FIELD, className)}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn('flex min-h-20 py-2', FIELD, className)}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('text-sm font-medium text-gray-700', className)}
      {...props}
    />
  )
}

export { Input, Textarea, Label }
