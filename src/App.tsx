import { AppShell } from '@/features/shell/AppShell'
import { LeadsPage } from '@/features/leads/LeadsPage'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <AppShell>
      <LeadsPage />
      <Toaster position="bottom-right" />
    </AppShell>
  )
}
