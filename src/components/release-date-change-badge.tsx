import type { ReleaseDateEvent } from "@/lib/api";
import { releaseDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHANGE_LABEL: Record<string, string> = {
  delayed: "延期",
  advanced: "提前",
  precise_confirmed: "日期确认",
  fuzzy_changed: "档期变化",
  tba_to_date: "定档",
  date_to_tba: "改为待定",
  date_corrected: "日期修正",
};

const CHANGE_CLASS: Record<string, string> = {
  delayed: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  advanced: "border-teal-400/30 bg-teal-400/10 text-teal-300",
  precise_confirmed: "border-[#7b8cde]/35 bg-[#7b8cde]/12 text-[#b7c2ff]",
  fuzzy_changed: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  tba_to_date: "border-[#7b8cde]/35 bg-[#7b8cde]/12 text-[#b7c2ff]",
  date_to_tba: "border-zinc-400/25 bg-zinc-400/10 text-zinc-300",
  date_corrected: "border-sky-400/30 bg-sky-400/10 text-sky-300",
};

export function releaseDateChangeText(event: ReleaseDateEvent | null | undefined) {
  if (!event) return null;
  const label = CHANGE_LABEL[event.change_type] ?? "发售日变化";
  if (event.change_type === "delayed" && event.delta_days) return `${label} ${event.delta_days}天`;
  if (event.change_type === "advanced" && event.delta_days) return `${label} ${Math.abs(event.delta_days)}天`;
  return label;
}

export function releaseDateChangeTitle(event: ReleaseDateEvent | null | undefined) {
  if (!event) return undefined;
  const oldLabel = releaseDate(event.old_release_date, event.old_release_date_is_fuzzy);
  const newLabel = releaseDate(event.new_release_date, event.new_release_date_is_fuzzy);
  return `${oldLabel} -> ${newLabel}`;
}

export function ReleaseDateChangeBadge({
  event,
  compact = false,
  className,
}: {
  event: ReleaseDateEvent | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  const text = releaseDateChangeText(event);
  if (!event || !text) return null;

  return (
    <span
      title={releaseDateChangeTitle(event)}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-semibold leading-none",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]",
        CHANGE_CLASS[event.change_type] ?? "border-[#2a2d3e] bg-white/[0.05] text-[#a0a8c0]",
        className,
      )}
    >
      {text}
    </span>
  );
}
