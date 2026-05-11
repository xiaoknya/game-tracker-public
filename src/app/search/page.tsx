import { AppShell, MobileNav } from "@/components/app-shell";
import { SearchResultsView } from "@/components/search-results-view";
import { gameApi } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "搜索结果",
  description: "搜索公开版游戏热度追踪中的 Steam 游戏。",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const [games, upcoming] = await Promise.all([
    query ? gameApi.search(query, 80) : Promise.resolve([]),
    gameApi.listUpcoming({ days: 90 }),
  ]);
  const hotGames = [...upcoming]
    .filter((game) => game.rating === "S" || game.rating === "A")
    .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))
    .slice(0, 24);

  return (
    <AppShell activePath="/search">
      <MobileNav />
      <SearchResultsView query={query} games={games} hotGames={hotGames} />
    </AppShell>
  );
}
