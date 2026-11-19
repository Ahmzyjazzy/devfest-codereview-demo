import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/icon'
import type { View } from '@/lib/view'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'

const BUSINESS_NAME = 'Ade’s Kitchen, Ibadan'

const NAV: { view: View; label: string; icon: IconName }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: 'widget-5' },
  { view: 'leads', label: 'Leads', icon: 'users-group-rounded' },
  { view: 'meetings', label: 'Meetings', icon: 'calendar' },
  { view: 'chat', label: 'Chat', icon: 'chat-round-dots' },
  { view: 'email', label: 'Email', icon: 'letter' },
]

function Brand() {
  return (
    <a
      href="#leads"
      aria-label="Qorelly Leads home"
      className="flex items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary">
        <img src="/logo-mark.svg" alt="" className="size-5" />
      </span>
      <span className="text-xl font-bold leading-tight text-gray-900">
        Qorelly
      </span>
    </a>
  )
}

function NavList({ view, onSelect }: { view: View; onSelect?: () => void }) {
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {NAV.map(item => {
          const active = item.view === view
          return (
            <li key={item.view}>
              <a
                href={`#${item.view}`}
                aria-current={active ? 'page' : undefined}
                onClick={onSelect}
                className={cn(
                  'flex min-h-[38px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gray-400',
                  active
                    ? 'bg-surface font-medium text-gray-900 ring-1 ring-hairline/[0.05]'
                    : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900',
                )}
              >
                <Icon
                  name={item.icon}
                  active={active}
                  className={active ? 'text-primary' : 'text-current'}
                />
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function RailFooter() {
  return (
    <p className="px-3 text-xs leading-5 text-gray-500">
      DevFest Ibadan 2026 demo. Data resets when you delete leads.db.
    </p>
  )
}

export function AppShell({
  view,
  children,
}: {
  view: View
  children: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-dvh bg-gray-100 lg:p-2">
      <aside className="hidden w-64 shrink-0 flex-col lg:flex">
        <div className="p-6">
          <Brand />
        </div>
        <div className="flex-1 px-3">
          <NavList view={view} />
        </div>
        <div className="pb-4">
          <RailFooter />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between pl-5 pr-3 lg:hidden">
          <Brand />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-11 items-center justify-center rounded-full text-gray-700 outline-none transition-colors hover:bg-gray-200/60 focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <Icon name="hamburger-menu" size={22} />
          </button>
        </header>

        <main className="mx-2 mb-2 flex min-h-0 flex-1 flex-col overflow-auto rounded-2xl bg-surface ring-1 ring-hairline/[0.05] lg:m-0">
          <div className="sticky top-0 z-30 flex min-h-[69px] shrink-0 items-center gap-2 bg-surface px-4 py-3 sm:px-8">
            <span className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <Icon name="buildings" size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {BUSINESS_NAME}
              </p>
              <p className="text-xs text-gray-500">Catering</p>
            </div>
          </div>
          <div className="w-full max-w-6xl flex-1 px-4 pb-10 pt-2 sm:px-8">
            {children}
          </div>
        </main>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="gap-6 bg-gray-100 px-3 py-5">
          <div className="px-3">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation</SheetDescription>
            <Brand />
          </div>
          <div className="flex-1">
            <NavList view={view} onSelect={() => setMenuOpen(false)} />
          </div>
          <RailFooter />
        </SheetContent>
      </Sheet>
    </div>
  )
}
