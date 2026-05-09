import type { Snapshot } from "@/lib/api";

function pointsFrom(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Sparkline({
  snapshots,
  className,
}: {
  snapshots: Snapshot[];
  className?: string;
}) {
  const values = snapshots
    .map((item) => item.steamdb_followers)
    .filter((item): item is number => typeof item === "number");
  const points = pointsFrom(values, 280, 74);

  return (
    <svg viewBox="0 0 280 74" className={className} role="img" aria-label="followers trend">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(94 234 212)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(94 234 212)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points="0,72 280,72"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      {points ? (
        <>
          <polygon points={`0,74 ${points} 280,74`} fill="url(#sparkline-fill)" />
          <polyline
            points={points}
            fill="none"
            stroke="rgb(94 234 212)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </>
      ) : (
        <text x="140" y="40" textAnchor="middle" className="fill-white/40 text-[10px]">
          暂无趋势
        </text>
      )}
    </svg>
  );
}

