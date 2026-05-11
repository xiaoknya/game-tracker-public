import { AppShell, MobileNav } from "@/components/app-shell";
import { SearchResultsView } from "@/components/search-results-view";
import { gameApi, type Game } from "@/lib/api";

const MIN_FOLLOWERS_FOR_FUZZY_MATCH = 1000;
const MIN_REVIEWS_FOR_RELEASED_FUZZY_MATCH = 500;

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
  const [backendResults, upcoming, fuzzy, released] = await Promise.all([
    query ? gameApi.search(query, 30) : Promise.resolve([]),
    gameApi.listUpcoming({ days: 365 }),
    gameApi.listFuzzy(12),
    gameApi.listReleased(180),
  ]);
  const publicGames = dedupeGames([...upcoming, ...fuzzy, ...released]);
  const games = query ? mergeSearchResults(backendResults, publicGames, query) : [];
  const hotGames = [...publicGames]
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

function dedupeGames(games: Game[]) {
  return [...new Map(games.map((game) => [game.id, game])).values()];
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function matchScore(game: Game, query: string) {
  const q = normalizeSearchText(query);
  if (!q) return -1;
  const fields = [
    game.name,
    game.name_en,
    game.developer,
    game.publisher,
    game.tags,
    game.genre,
  ];
  const normalizedFields = fields.map(normalizeSearchText).filter(Boolean);

  if (normalizedFields.some((field) => field === q)) return 100;
  if (normalizedFields.some((field) => field.startsWith(q))) return 80;
  if (normalizedFields.some((field) => field.includes(q))) return 60;

  const tokens = query
    .normalize("NFKC")
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map(normalizeSearchText)
    .filter((token) => token.length >= 2);
  if (tokens.length > 0 && tokens.every((token) => normalizedFields.some((field) => field.includes(token)))) {
    return 40;
  }
  return -1;
}

function mergeSearchResults(backendResults: Game[], publicGames: Game[], query: string) {
  const byId = new Map<number, { game: Game; score: number; index: number }>();

  backendResults.forEach((game, index) => {
    const score = Math.max(matchScore(game, query), 70);
    if (!passesPublicSearchQuality(game, score)) return;
    byId.set(game.id, { game, score, index });
  });

  publicGames.forEach((game, index) => {
    const score = matchScore(game, query);
    if (score < 0) return;
    if (!passesPublicSearchQuality(game, score)) return;
    const existing = byId.get(game.id);
    if (!existing || score > existing.score) {
      byId.set(game.id, { game, score, index: existing?.index ?? backendResults.length + index });
    }
  });

  return [...byId.values()]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.game.total_score ?? 0) - (a.game.total_score ?? 0) || a.index - b.index;
    })
    .map(({ game }) => game);
}

function passesPublicSearchQuality(game: Game, score: number) {
  if (score >= 100) return true;
  if ((game.followers ?? 0) >= MIN_FOLLOWERS_FOR_FUZZY_MATCH) return true;
  if (getReviewTotal(game) >= MIN_REVIEWS_FOR_RELEASED_FUZZY_MATCH) return true;
  return false;
}

function getReviewTotal(game: Game) {
  if ("steam_review_total" in game && typeof game.steam_review_total === "number") {
    return game.steam_review_total;
  }
  return 0;
}
