import { AppShell, MobileNav } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { FilterChip, SectionPanel } from "@/components/section-panel";
import { gameApi } from "@/lib/api";

const ratings = [
  { value: "", label: "全部" },
  { value: "S", label: "S", tone: "s" as const },
  { value: "A", label: "A", tone: "a" as const },
  { value: "B", label: "B", tone: "b" as const },
  { value: "C", label: "C", tone: "c" as const },
];

const dayOptions = [7, 15, 30, 60];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; days?: string }>;
}) {
  const params = await searchParams;
  const selectedRating = params.rating?.toUpperCase() ?? "";
  const selectedDays = Number(params.days ?? 60);

  const [games, fuzzyGames] = await Promise.all([
    gameApi.listUpcoming({
      rating: selectedRating || undefined,
      days: Number.isFinite(selectedDays) ? selectedDays : 60,
    }),
    gameApi.listFuzzy(),
  ]);

  const stats = [
    { key: "s", label: "S 级游戏", value: games.filter((game) => game.rating === "S").length },
    { key: "a", label: "A 级游戏", value: games.filter((game) => game.rating === "A").length },
    { key: "b", label: "B 级游戏", value: games.filter((game) => game.rating === "B").length },
    { key: "c", label: "C 级游戏", value: games.filter((game) => game.rating === "C").length },
    { key: "all", label: "追踪总数", value: games.length },
  ];

  return (
    <AppShell activePath="/">
      <MobileNav />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4 shadow-[0_10px_26px_rgba(2,6,23,0.3)] stat-${stat.key}`}
          >
            <div className="font-mono text-3xl font-semibold text-[#e0e4f0]">{stat.value}</div>
            <div className="mt-1 text-xs text-[#7a8099]">{stat.label}</div>
          </div>
        ))}
      </div>

      <SectionPanel
        title="即将发售"
        count={games.length}
        actions={
          <>
            {ratings.map((rating) => (
              <FilterChip
                key={rating.value || "all"}
                href={`/?${new URLSearchParams({
                  ...(rating.value ? { rating: rating.value } : {}),
                  days: String(selectedDays),
                }).toString()}`}
                active={selectedRating === rating.value}
                tone={rating.tone}
              >
                {rating.label}
              </FilterChip>
            ))}
            <span className="mx-1 hidden h-6 w-px bg-[#2a2d3e] sm:block" />
            {dayOptions.map((days) => (
              <FilterChip
                key={days}
                href={`/?${new URLSearchParams({
                  ...(selectedRating ? { rating: selectedRating } : {}),
                  days: String(days),
                }).toString()}`}
                active={selectedDays === days}
              >
                {days}天
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
          <EmptyMessage text="暂无即将发售游戏" />
        )}
      </SectionPanel>

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
          <EmptyMessage text="暂无待定发售日游戏" />
        )}
      </SectionPanel>
    </AppShell>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
      {text}
    </div>
  );
}

