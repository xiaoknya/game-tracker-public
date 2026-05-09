import { AppShell, MobileNav } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { FilterChip, SectionPanel } from "@/components/section-panel";
import { gameApi } from "@/lib/api";

const dayOptions = [30, 60, 90, 180];

export default async function ReleasedPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const selectedDays = Number(params.days ?? 60);
  const games = await gameApi.listReleased(Number.isFinite(selectedDays) ? selectedDays : 60);

  return (
    <AppShell activePath="/released">
      <MobileNav />
      <SectionPanel
        title="近期已发售"
        count={games.length}
        actions={
          <>
            {dayOptions.map((days) => (
              <FilterChip key={days} href={`/released?days=${days}`} active={selectedDays === days}>
                {days === 180 ? "半年" : `${days}天`}
              </FilterChip>
            ))}
          </>
        }
      >
        {games.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {games.map((game) => (
              <DashboardCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
            暂无符合条件的已发售游戏
          </div>
        )}
      </SectionPanel>
    </AppShell>
  );
}

