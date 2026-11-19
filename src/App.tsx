import { AppShell } from '@/features/shell/AppShell'
import { ChatPage } from '@/features/chat/ChatPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { EmailComposerPage } from '@/features/email/EmailComposerPage'
import { LeadsPage } from '@/features/leads/LeadsPage'
import { MeetingsPage } from '@/features/meetings/MeetingsPage'
import { Toaster } from '@/components/ui/sonner'
import { useHashView } from '@/lib/view'

export default function App() {
  const view = useHashView()

  return (
    <AppShell view={view}>
      {view === 'leads' && <LeadsPage />}
      {view === 'dashboard' && <DashboardPage />}
      {view === 'meetings' && <MeetingsPage />}
      {view === 'chat' && <ChatPage />}
      {view === 'email' && <EmailComposerPage />}
      <Toaster position="bottom-right" />
    </AppShell>
  )
}
