export type Rating = "S" | "A" | "B" | "C" | string | null;

export interface Game {
  id: number;
  steam_appid: number;
  name: string;
  name_en: string | null;
  release_date: string | null;
  release_date_is_fuzzy: boolean | null;
  release_date_raw: string | null;
  release_date_source: string | null;
  release_date_last_changed_at: string | null;
  release_date_change_count: number;
  genre: string | null;
  developer: string | null;
  publisher: string | null;
  tags: string | null;
  short_description: string | null;
  is_free: number | null;
  steam_url: string | null;
  steamdb_url: string | null;
  cover_image: string | null;
  reddit_subreddit: string | null;
  social_links: Record<string, string> | null;
  modifier_adaptation_required: boolean | null;
  rating: Rating;
  total_score: number | null;
  score_date: string | null;
  followers: number | null;
  followers_7d_delta: number | null;
  days_to_release: number | null;
  latest_release_date_event: ReleaseDateEvent | null;
  primary_price: GamePrice | null;
}

export interface GamePrice {
  id: number;
  game_id: number;
  steam_appid: number;
  region_code: string;
  currency: string | null;
  initial_price: number | null;
  final_price: number | null;
  discount_percent: number | null;
  is_free: boolean;
  is_available: boolean;
  fetched_at: string;
}

export interface GamePriceSnapshot {
  id: number;
  game_id: number;
  steam_appid: number;
  region_code: string;
  currency: string | null;
  initial_price: number | null;
  final_price: number | null;
  discount_percent: number | null;
  is_free: boolean;
  is_available: boolean;
  snapshot_date: string;
  source: string;
}

export interface ReleaseDateEvent {
  id: number;
  game_id: number;
  steam_appid: number;
  old_release_date: string | null;
  old_release_date_is_fuzzy: boolean;
  old_release_date_raw: string | null;
  new_release_date: string | null;
  new_release_date_is_fuzzy: boolean;
  new_release_date_raw: string | null;
  change_type: string;
  delta_days: number | null;
  source: string;
  detected_at: string;
}

export interface ReleasedGame extends Game {
  steam_review_score_desc: string | null;
  steam_review_total: number | null;
  steam_review_positive: number | null;
  steam_median_playtime: number | null;
  review_topics: ReviewTopic[] | null;
  review_tags: string[] | null;
  language_dist: Record<string, number> | null;
}

export interface Snapshot {
  snapshot_date: string;
  steamdb_followers: number | null;
  steamdb_followers_7d_delta: number | null;
  bili_top_video_views: number | null;
  bili_videos_over_1m: number | null;
  bili_videos_over_500k: number | null;
  reddit_members: number | null;
  steam_review_total: number | null;
  steam_review_positive: number | null;
  steam_review_score_desc: string | null;
  steam_median_playtime: number | null;
}

export interface Score {
  score_date: string;
  score_followers: number | null;
  score_growth: number | null;
  score_reddit: number | null;
  score_baidu?: number | null;
  score_bilibili: number | null;
  score_mod: number | null;
  total_score: number | null;
  rating: Rating;
}

export type ReviewSentiment =
  | "strongly_positive"
  | "positive"
  | "mixed"
  | "negative"
  | "strongly_negative";

export interface ReviewTopic {
  title: string;
  description: string;
  sentiment: ReviewSentiment;
  pct: number;
}

export interface ReviewSummary {
  game_id: number;
  generated_at: string;
  model: string;
  review_count: number;
  topics: ReviewTopic[] | null;
  tags: string[] | null;
}

export interface ReviewMonthlyStat {
  month: string;
  new_reviews: number | null;
  new_positive: number | null;
  positive_rate: number | null;
  language_dist: Record<string, number> | null;
}

export interface SimilarGame {
  id: number;
  name: string;
  steam_appid: number | null;
  cover_image: string | null;
  rating: Rating;
  followers: number | null;
}

const API_BASE =
  process.env.GAME_TRACKER_API_BASE?.replace(/\/$/, "") ??
  "http://localhost:8000/api";

type QueryValue = string | number | boolean | null | undefined;

function url(path: string, params?: Record<string, QueryValue>) {
  const target = new URL(`${API_BASE}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      target.searchParams.set(key, String(value));
    }
  });
  return target.toString();
}

async function apiGet<T>(
  path: string,
  params?: Record<string, QueryValue>,
  options?: { fallback: T; revalidate?: number },
): Promise<T> {
  try {
    const res = await fetch(url(path, params), {
      next: { revalidate: options?.revalidate ?? 300 },
    });
    if (!res.ok) return options?.fallback as T;
    return (await res.json()) as T;
  } catch {
    return options?.fallback as T;
  }
}

export const gameApi = {
  listUpcoming: (params?: { rating?: string; days?: number }) =>
    apiGet<Game[]>("/games", params, { fallback: [] }),
  listFuzzy: (months = 12) =>
    apiGet<Game[]>("/games/fuzzy", { months }, { fallback: [] }),
  listReleased: (days = 90) =>
    apiGet<ReleasedGame[]>("/games/released", { days }, { fallback: [] }),
  search: (q: string, limit = 30) =>
    apiGet<Game[]>("/games/search", { q, limit }, { fallback: [], revalidate: 60 }),
  getGame: (id: number) =>
    apiGet<Game | null>(`/games/${id}`, undefined, { fallback: null }),
  getTrend: (id: number, days = 30) =>
    apiGet<Snapshot[]>(`/games/${id}/trend`, { days }, { fallback: [] }),
  getScores: (id: number) =>
    apiGet<Score[]>(`/games/${id}/scores`, undefined, { fallback: [] }),
  getReviewMonthly: (id: number, months = 12) =>
    apiGet<ReviewMonthlyStat[]>(
      `/games/${id}/review-monthly`,
      { months },
      { fallback: [] },
    ),
  getReviewSummary: (id: number) =>
    apiGet<ReviewSummary | null>(`/games/${id}/review-summary`, undefined, {
      fallback: null,
    }),
  getSimilar: (id: number) =>
    apiGet<SimilarGame[]>(`/games/${id}/similar`, { limit: 6 }, { fallback: [] }),
  getReleaseDateEvents: (id: number, limit = 20) =>
    apiGet<ReleaseDateEvent[]>(`/games/${id}/release-date-events`, { limit }, { fallback: [] }),
  getPrices: (id: number) =>
    apiGet<GamePrice[]>(`/games/${id}/prices`, undefined, { fallback: [] }),
  getPriceHistory: (id: number, region = "CN", days = 365) =>
    apiGet<GamePriceSnapshot[]>(
      `/games/${id}/price-history`,
      { region, days },
      { fallback: [] },
    ),
};

export function steamCover(appid: number | null | undefined) {
  if (!appid) return "";
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
}
