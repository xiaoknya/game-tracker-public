import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Rating } from "@/lib/api";

const tone: Record<string, string> = {
  S: "border-rose-500 bg-rose-600 text-white shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
  A: "border-amber-500 bg-amber-500 text-white shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
  B: "border-sky-500 bg-sky-600 text-white shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
  C: "border-zinc-500 bg-zinc-600 text-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]",
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
        tone[String(rating ?? "")] ?? "border-zinc-500 bg-zinc-700 text-zinc-300",
        className,
      )}
    >
      {label}
    </Badge>
  );
}

