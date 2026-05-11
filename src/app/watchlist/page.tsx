import { AppShell, MobileNav } from "@/components/app-shell";
import { WatchlistView } from "@/components/watchlist-view";
import { gameApi } from "@/lib/api";

export const metadata = {
  title: "我的收藏 | 游戏热度追踪",
  description: "本地保存的公开版游戏关注列表。",
};

export default async function WatchlistPage() {
  const [upcomingGames, fuzzyGames, releasedGames] = await Promise.all([
    gameApi.listUpcoming({ days: 180 }),
    gameApi.listFuzzy(),
    gameApi.listReleased(180),
  ]);

  const byId = new Map(
    [...upcomingGames, ...fuzzyGames, ...releasedGames].map((game) => [game.id, game]),
  );

  return (
    <AppShell activePath="/watchlist">
      <MobileNav />
      <WatchlistView games={[...byId.values()]} />
    </AppShell>
  );
}
