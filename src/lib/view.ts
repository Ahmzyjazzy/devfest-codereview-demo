import { useEffect, useState } from 'react'

export const VIEWS = ['leads', 'dashboard', 'meetings', 'chat', 'email'] as const

export type View = (typeof VIEWS)[number]

function readHash(): View {
  const hash = window.location.hash.replace('#', '')
  return (VIEWS as readonly string[]).includes(hash) ? (hash as View) : 'leads'
}

export function useHashView(): View {
  const [view, setView] = useState<View>(readHash)

  useEffect(() => {
    const onChange = () => setView(readHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return view
}
