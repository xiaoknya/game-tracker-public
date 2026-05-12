import { AppShell, MobileNav } from "@/components/app-shell";
import { SteamRecommendationsView } from "@/components/steam-recommendations-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "为我推荐",
  description: "连接 Steam 后，基于游戏库和游玩时长推荐已发售与即将发售游戏。",
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ steam_error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell activePath="/recommendations">
      <MobileNav />
      <SteamRecommendationsView initialError={params.steam_error} />
    </AppShell>
  );
}
