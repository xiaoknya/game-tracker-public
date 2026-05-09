import { cn } from "@/lib/utils";

export function MetricRow({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "teal" | "rose" | "amber";
}) {
  return (
    <div className="border-t border-white/10 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-2xl text-white",
          tone === "teal" && "text-teal-100",
          tone === "rose" && "text-rose-100",
          tone === "amber" && "text-amber-100",
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-white/40">{sub}</div> : null}
    </div>
  );
}

