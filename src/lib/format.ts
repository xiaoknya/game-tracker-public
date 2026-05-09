import type { Game, Rating } from "@/lib/api";

export function compactNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function integer(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Intl.NumberFormat("en").format(value);
}

export function signedCompact(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${compactNumber(value)}`;
}

export function score(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value.toFixed(1);
}

export function releaseDate(value: string | null | undefined, fuzzy?: boolean | null) {
  if (!value) return "TBA";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: fuzzy ? undefined : "numeric",
  });
  return fuzzy ? `${formatted} 待定` : formatted;
}

export function releaseStatus(game: Game) {
  if (game.days_to_release === null || game.days_to_release === undefined) {
    return game.release_date_is_fuzzy ? "窗口待定" : "日期待定";
  }
  if (game.days_to_release === 0) return "今日发售";
  if (game.days_to_release > 0) return `${game.days_to_release} 天后`;
  return `已发售 ${Math.abs(game.days_to_release)} 天`;
}

export function ratingLabel(rating: Rating) {
  return rating || "未评级";
}

export function tagsFromGame(game: Pick<Game, "tags" | "genre">, limit = 3) {
  const raw = game.tags || game.genre || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

