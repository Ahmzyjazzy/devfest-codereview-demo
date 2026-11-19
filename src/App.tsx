import { AppShell } from '@/features/shell/AppShell'
import { PageHeader } from '@/components/ui/page-header'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <AppShell>
      <PageHeader title="Leads" subtitle="Track the businesses you are pitching." />
      <Toaster position="bottom-right" />
    </AppShell>
  )
}
