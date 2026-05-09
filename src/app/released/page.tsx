import { AppShell, MobileNav } from "@/components/app-shell";
import { ReleasedSection } from "@/components/released-section";
import { gameApi } from "@/lib/api";

const RATING_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

export default async function ReleasedPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const selectedDays = Number(params.days ?? 60);
  const days = Number.isFinite(selectedDays) ? selectedDays : 60;

  const rawGames = await gameApi.listReleased(days);

  // Sort: S > A > B > C, same rating by release_date desc
  const allGames = [...rawGames].sort((a, b) => {
    const ratingGap =
      (RATING_ORDER[a.rating ?? ""] ?? 9) - (RATING_ORDER[b.rating ?? ""] ?? 9);
    if (ratingGap !== 0) return ratingGap;
    return (b.release_date ?? "").localeCompare(a.release_date ?? "");
  });

  return (
    <AppShell activePath="/released">
      <MobileNav />
      {/* Client-side SABC multi-select filter, days via href */}
      <ReleasedSection allGames={allGames} selectedDays={days} />
    </AppShell>
  );
}
