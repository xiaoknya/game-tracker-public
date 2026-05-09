import { AppShell, MobileNav } from "@/components/app-shell";
import { ReleasedCard } from "@/components/released-card";
import { FilterChip, SectionPanel } from "@/components/section-panel";
import { gameApi } from "@/lib/api";

const dayOptions = [30, 60, 90, 180];

// S > A > B > C，同评级按发售日降序（与 Vue 版一致）
const RATING_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

export default async function ReleasedPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const selectedDays = Number(params.days ?? 60);
  const rawGames = await gameApi.listReleased(Number.isFinite(selectedDays) ? selectedDays : 60);

  const games = [...rawGames].sort((a, b) => {
    const ratingGap = (RATING_ORDER[a.rating ?? ""] ?? 9) - (RATING_ORDER[b.rating ?? ""] ?? 9);
    if (ratingGap !== 0) return ratingGap;
    return (b.release_date ?? "").localeCompare(a.release_date ?? "");
  });

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
              <ReleasedCard key={game.id} game={game} />
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
