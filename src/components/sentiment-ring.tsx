/** SVG donut chart showing positive vs negative review sentiment */
export function SentimentRing({
  positive,
  total,
}: {
  positive: number | null | undefined;
  total: number | null | undefined;
}) {
  if (!total || !positive) {
    return (
      <div className="grid h-32 place-items-center text-xs text-[#5a6080]">暂无评测</div>
    );
  }

  const pct = Math.round((positive / total) * 100);

  // SVG donut math
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = 38;
  const stroke = 11;
  const circumference = 2 * Math.PI * r;

  const posArc = (pct / 100) * circumference;

  // Color based on rate
  const posColor = pct >= 80 ? "#34d399" : pct >= 60 ? "#7b8cde" : pct >= 40 ? "#fbbf24" : "#f87171";
  const negColor = "#2a2d3e";

  return (
    <div className="flex items-center gap-3">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-24 shrink-0 select-none" role="img" aria-label="sentiment donut">
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={negColor}
          strokeWidth={stroke}
        />
        {/* Positive arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={posColor}
          strokeWidth={stroke}
          strokeDasharray={`${posArc.toFixed(2)} ${circumference.toFixed(2)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Center text */}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#e0e4f0" fontFamily="monospace">
          {pct}%
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="#7a8099">
          好评
        </text>
      </svg>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: posColor }} />
          <span className="text-[#a0a8c0]">好评</span>
          <span className="ml-auto font-mono text-[#e0e4f0]">{Intl.NumberFormat("en", { notation: "compact" }).format(positive)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#4a3040]" />
          <span className="text-[#a0a8c0]">差评</span>
          <span className="ml-auto font-mono text-[#e0e4f0]">{Intl.NumberFormat("en", { notation: "compact" }).format(total - positive)}</span>
        </div>
        <div className="border-t border-[#2a2d3e] pt-1 font-mono text-[#7a8099]">
          共 {Intl.NumberFormat("en", { notation: "compact" }).format(total)} 条
        </div>
      </div>
    </div>
  );
}
