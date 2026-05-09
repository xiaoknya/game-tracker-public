import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Rating } from "@/lib/api";

const tone: Record<string, string> = {
  S: "border-rose-400/60 bg-rose-500/15 text-rose-100",
  A: "border-amber-300/60 bg-amber-400/15 text-amber-100",
  B: "border-sky-300/60 bg-sky-400/15 text-sky-100",
  C: "border-zinc-500/60 bg-zinc-400/10 text-zinc-300",
};

export function RatingBadge({
  rating,
  className,
}: {
  rating: Rating;
  className?: string;
}) {
  const label = rating || "—";
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 min-w-9 justify-center rounded-md border px-2 font-mono text-sm",
        tone[String(rating ?? "")] ?? "border-white/20 bg-white/10 text-white/70",
        className,
      )}
    >
      {label}
    </Badge>
  );
}

