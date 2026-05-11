import { AppShell, MobileNav } from '@/components/app-shell'
import { CalendarView } from '@/components/calendar-view'
import { gameApi } from '@/lib/api'

export default async function CalendarPage() {
  const [upcoming, fuzzy] = await Promise.all([
    gameApi.listUpcoming({ days: 365 }),
    gameApi.listFuzzy(12),
  ])
  return (
    <AppShell activePath="/calendar">
      <MobileNav />
      <CalendarView upcomingGames={upcoming} fuzzyGames={fuzzy} />
    </AppShell>
  )
}
