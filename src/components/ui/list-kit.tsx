import { forwardRef, useId, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/cn'
import { Button } from './button'
import { Icon, type IconName } from './icon'
import { WellHeader, type WellHeaderProps } from './tray'

export interface KitButtonProps {
  icon?: IconName
  children: ReactNode
  onClick?: () => void
  href?: string
  external?: boolean
  compact?: boolean
  disabled?: boolean
  title?: string
}

const PRIMARY =
  'flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover'
const QUIET_MATERIAL =
  'flex h-10 items-center justify-center gap-2 rounded-full bg-surface text-sm font-medium text-gray-900 ring-1 ring-hairline/[0.06] transition-colors hover:bg-gray-50'
const HAIRLINE_SHEET = 'bg-surface ring-1 ring-hairline/[0.04]'

function KitButton({
  className,
  active,
  iconClassName,
  icon,
  children,
  onClick,
  href,
  external,
  compact,
  disabled,
  title: titleProp,
}: KitButtonProps & {
  className: string
  active: boolean
  iconClassName?: string
}) {
  const label = typeof children === 'string' ? children : undefined
  const title = titleProp ?? (compact ? label : undefined)
  const body = (
    <>
      {icon && (
        <Icon name={icon} active={active} size={16} className={iconClassName} />
      )}
      {compact ? <span className="max-sm:sr-only">{children}</span> : children}
    </>
  )
  const cls = cn(
    className,
    href && 'shrink-0',
    compact && 'max-sm:w-10 max-sm:px-0',
    disabled && 'cursor-not-allowed opacity-50',
  )
  if (disabled)
    return (
      <button type="button" disabled className={cls} title={title}>
        {body}
      </button>
    )
  if (href)
    return (
      <a
        href={href}
        onClick={onClick}
        className={cls}
        title={title}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {body}
      </a>
    )
  return (
    <button type="button" onClick={onClick} className={cls} title={title}>
      {body}
    </button>
  )
}

export function PrimaryButton({
  icon = 'add-circle',
  ...props
}: KitButtonProps) {
  return <KitButton {...props} icon={icon} className={PRIMARY} active />
}

export function QuietButton(props: KitButtonProps) {
  return (
    <KitButton
      {...props}
      className={`${QUIET_MATERIAL} px-4`}
      active={false}
      iconClassName="text-gray-500"
    />
  )
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string; count?: number }[]
  value: K
  onChange: (key: K) => void
}) {
  const thumbId = useId()
  const reduce = useReducedMotion()
  return (
    <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-xl bg-gray-100 p-1">
      {options.map(o => {
        const on = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
              on ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900',
            )}
          >
            {on && (
              <motion.span
                layoutId={thumbId}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 38 }
                }
                className="absolute inset-0 rounded-lg bg-surface ring-1 ring-hairline/[0.06]"
              />
            )}
            <span className="relative">{o.label}</span>
            {o.count != null && (
              <span className="relative text-xs tabular-nums text-gray-400">
                {o.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
  autoFocus?: boolean
}) {
  return (
    <div className={cn('relative', className)}>
      <Icon
        name="magnifier"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        aria-label={placeholder}
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-surface pl-9 pr-3 text-sm text-gray-900 ring-1 ring-hairline/[0.06] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  )
}

export function SelectField<K extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: K
  onChange: (v: K) => void
  options: { value: K; label: string }[]
  label: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value as K)}
        className="h-10 w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl bg-surface pl-3.5 pr-9 text-sm text-gray-900 ring-1 ring-hairline/[0.06] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="alt-arrow-down"
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  )
}

export function SheetTable({
  children,
  footer,
  className,
  sheetClassName,
  title,
  count,
  description,
  caption,
  action,
}: {
  children: ReactNode
  footer?: ReactNode
  className?: string
  sheetClassName?: string
} & Partial<WellHeaderProps>) {
  return (
    <div className={cn('rounded-well bg-gray-100 p-1', className)}>
      {title != null && (
        <WellHeader
          title={title}
          count={count}
          description={description}
          caption={caption}
          action={action}
        />
      )}
      <div
        className={cn(
          'overflow-x-auto rounded-sheet',
          HAIRLINE_SHEET,
          '[&_table]:w-full [&_table]:text-left [&_table]:text-sm [&_table]:text-gray-900',
          '[&_th]:whitespace-nowrap [&_th]:px-4 [&_th]:py-3 [&_th]:text-[13px] [&_th]:font-normal [&_th]:text-gray-500',
          '[&_td]:px-4 [&_td]:py-3 [&_td]:align-middle',
          '[&_tbody_tr]:border-t [&_tbody_tr]:border-gray-100 [&_tbody_tr]:transition-colors',
          '[&_tbody_tr:hover]:bg-gray-50/70',
          sheetClassName,
        )}
      >
        {children}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 pt-3 text-sm text-gray-500">
          {footer}
        </div>
      )}
    </div>
  )
}

export type PillTone = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'gray'

const PILL: Record<PillTone, [string, string]> = {
  green: ['bg-emerald-50 text-emerald-700', 'bg-emerald-500'],
  amber: ['bg-amber-50 text-amber-700', 'bg-amber-500'],
  red: ['bg-red-50 text-red-600', 'bg-red-500'],
  blue: ['bg-blue-50 text-blue-700', 'bg-blue-500'],
  violet: ['bg-violet-50 text-violet-700', 'bg-violet-500'],
  gray: ['bg-gray-100 text-gray-600', 'bg-gray-400'],
}

export function Pill({
  tone,
  children,
  dot = true,
}: {
  tone: PillTone
  children: ReactNode
  dot?: boolean
}) {
  const [cls, dotCls] = PILL[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        cls,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dotCls)} />}
      {children}
    </span>
  )
}

export interface EmptyRowsProps {
  icon?: IconName
  title: string
  body?: string
  action?: ReactNode
}

export function EmptyRows({
  icon = 'magnifier',
  title,
  body,
  action,
}: EmptyRowsProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon name={icon} size={18} />
      </span>
      <p className="font-medium tracking-tight text-gray-900">{title}</p>
      {body && <p className="max-w-xs text-sm text-gray-500">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function EmptySheet({
  className,
  ...props
}: EmptyRowsProps & { className?: string }) {
  return (
    <SheetTable className={className}>
      <EmptyRows {...props} />
    </SheetTable>
  )
}

export function SheetPager({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  if (total === 0) return null
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, total)
  const pagerButtons = [
    ['alt-arrow-left', 'Previous page', page === 0, page - 1],
    ['alt-arrow-right', 'Next page', page >= pages - 1, page + 1],
  ] as const
  return (
    <>
      <span className="tabular-nums">
        {from}–{to} of {total.toLocaleString()}
      </span>
      <div className="flex gap-1">
        {pagerButtons.map(([icon, label, off, target]) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            disabled={disabled || off}
            onClick={() => onPageChange(target)}
            className="size-8 text-gray-700 hover:bg-gray-200/70"
          >
            <Icon name={icon} size={16} />
          </Button>
        ))}
      </div>
    </>
  )
}

export const RowMenuTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="More actions"
    {...props}
    className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
  >
    <Icon name="menu-dots" active size={16} />
  </button>
))
RowMenuTrigger.displayName = 'RowMenuTrigger'

export const QuietMenuTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="More actions"
    {...props}
    className={`${QUIET_MATERIAL} w-10 shrink-0 text-gray-600`}
  >
    <Icon name="menu-dots" active size={16} />
  </button>
))
QuietMenuTrigger.displayName = 'QuietMenuTrigger'
