import { AppShell, MobileNav } from "@/components/app-shell";
import { DashboardSection } from "@/components/dashboard-section";
import { SectionPanel } from "@/components/section-panel";
import { DashboardCard } from "@/components/dashboard-card";
import { gameApi } from "@/lib/api";

export const metadata = {
  title: "主看板",
  description: "按评级、热度、发售时间和标签浏览即将发售的 Steam 游戏。",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const selectedDays = Number(params.days ?? 60);
  const days = Number.isFinite(selectedDays) ? selectedDays : 60;

  // Fetch all games for the selected period — client filters by rating
  const [allGames, fuzzyGames] = await Promise.all([
    gameApi.listUpcoming({ days }),
    gameApi.listFuzzy(),
  ]);

  const stats = [
    { key: "s", label: "S 级游戏", value: allGames.filter((g) => g.rating === "S").length },
    { key: "a", label: "A 级游戏", value: allGames.filter((g) => g.rating === "A").length },
    { key: "b", label: "B 级游戏", value: allGames.filter((g) => g.rating === "B").length },
    { key: "c", label: "C 级游戏", value: allGames.filter((g) => g.rating === "C").length },
    { key: "all", label: "追踪总数", value: allGames.length },
  ];

  return (
    <AppShell activePath="/">
      <MobileNav />

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4 shadow-[0_10px_26px_rgba(2,6,23,0.3)]"
          >
            <div className="font-mono text-3xl font-semibold text-[#e0e4f0]">{stat.value}</div>
            <div className="mt-1 text-xs text-[#7a8099]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Upcoming games — client-side SABC multi-select filter ── */}
      <DashboardSection allGames={allGames} selectedDays={days} />

      {/* ── Fuzzy release date ── */}
      <SectionPanel
        title="待定发售日"
        count={fuzzyGames.length}
        subtitle="Steam 仅公布月份，具体日期未知"
      >
        {fuzzyGames.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {fuzzyGames.slice(0, 12).map((game) => (
              <DashboardCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
            暂无待定发售日游戏
          </div>
        )}
      </SectionPanel>
    </AppShell>
  );
}
