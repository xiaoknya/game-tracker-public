import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Rating } from "@/lib/api";

const tone: Record<string, string> = {
  S: "border-rose-400/70 bg-black/70 text-rose-300 backdrop-blur-sm shadow-[0_1px_6px_rgba(0,0,0,0.6)]",
  A: "border-amber-400/70 bg-black/70 text-amber-300 backdrop-blur-sm shadow-[0_1px_6px_rgba(0,0,0,0.6)]",
  B: "border-sky-400/70 bg-black/70 text-sky-300 backdrop-blur-sm shadow-[0_1px_6px_rgba(0,0,0,0.6)]",
  C: "border-zinc-400/50 bg-black/70 text-zinc-300 backdrop-blur-sm shadow-[0_1px_6px_rgba(0,0,0,0.5)]",
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
        tone[String(rating ?? "")] ?? "border-zinc-400/40 bg-black/70 text-zinc-400 backdrop-blur-sm",
        className,
      )}
    >
      {label}
    </Badge>
  );
}

