import * as React from 'react'

import { cn } from '@/lib/cn'
import { Icon } from './icon'

interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconSize?: number
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  (
    {
      className,
      iconSize = 18,
      type = 'button',
      'aria-label': label = 'Close',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200/70 text-gray-700 outline-none transition-colors hover:bg-gray-300/70 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/15 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Icon name="close" size={iconSize} />
    </button>
  ),
)
CloseButton.displayName = 'CloseButton'

export { CloseButton }
