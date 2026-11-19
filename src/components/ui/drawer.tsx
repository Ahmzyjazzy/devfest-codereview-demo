import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/cn'
import { CloseButton } from './close-button'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const WIDTHS: Record<NonNullable<DrawerProps['width']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Drawer({
  open,
  onClose,
  title,
  width = 'md',
  footer,
  children,
  className,
}: DrawerProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              'relative m-2 flex h-[calc(100%-1rem)] w-full flex-col overflow-hidden rounded-[20px] bg-surface ring-1 ring-hairline/5',
              WIDTHS[width],
              className,
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <header className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-[17px] font-medium tracking-tight text-gray-900">
                {title}
              </h2>
              <CloseButton onClick={onClose} />
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
