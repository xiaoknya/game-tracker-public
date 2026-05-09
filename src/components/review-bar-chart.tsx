import type { ReviewMonthlyStat } from "@/lib/api";

const W = 340;
const H = 120;
const PAD = { top: 10, right: 8, bottom: 28, left: 36 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

export function ReviewBarChart({ data }: { data: ReviewMonthlyStat[] }) {
  const items = data.slice(-9);
  if (items.length === 0) {
    return (
      <div className="grid h-28 place-items-center text-xs text-[#5a6080]">暂无评测数据</div>
    );
  }

  const maxReviews = Math.max(...items.map((d) => d.new_reviews ?? 0), 1);
  const barW = Math.max(4, CHART_W / items.length - 4);
  const gap = CHART_W / items.length;

  // Y grid levels
  const yTicks = [0, 0.5, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="monthly reviews">
      {/* Y grid lines */}
      {yTicks.map((t) => {
        const y = PAD.top + CHART_H * (1 - t);
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={y.toFixed(1)}
              x2={W - PAD.right}
              y2={y.toFixed(1)}
              stroke="#2a2d3e"
              strokeWidth="1"
              strokeDasharray={t === 0 ? undefined : "3,3"}
            />
            {t > 0 && (
              <text x={PAD.left - 4} y={(y + 3).toFixed(1)} textAnchor="end" fontSize="8" fill="#5a6080">
                {Math.round(maxReviews * t)}
              </text>
            )}
          </g>
        );
      })}

      {/* Bars */}
      {items.map((item, i) => {
        const cx = PAD.left + i * gap + gap / 2;
        const barH = Math.max(2, ((item.new_reviews ?? 0) / maxReviews) * CHART_H);
        const barX = cx - barW / 2;
        const barY = PAD.top + CHART_H - barH;

        // Positive rate gradient color: high = emerald, low = rose, mid = slate
        const rate = item.positive_rate ?? 0;
        const barColor =
          rate >= 0.8
            ? "rgb(52,211,153)"
            : rate >= 0.6
              ? "rgb(123,140,222)"
              : rate >= 0.4
                ? "rgb(251,191,36)"
                : "rgb(248,113,113)";

        const label = item.month?.slice(0, 7) ?? "";
        const shortLabel = label.slice(5); // MM

        return (
          <g key={item.month}>
            <rect
              x={barX.toFixed(1)}
              y={barY.toFixed(1)}
              width={barW.toFixed(1)}
              height={barH.toFixed(1)}
              rx="2"
              fill={barColor}
              fillOpacity="0.75"
            />
            {/* X label */}
            <text
              x={cx.toFixed(1)}
              y={(PAD.top + CHART_H + 10).toFixed(1)}
              textAnchor="middle"
              fontSize="8"
              fill="#5a6080"
            >
              {shortLabel}
            </text>
            {/* Positive rate line dot */}
            {item.positive_rate != null && (
              <circle
                cx={cx.toFixed(1)}
                cy={(PAD.top + CHART_H * (1 - item.positive_rate)).toFixed(1)}
                r="2.5"
                fill="rgb(251,191,36)"
              />
            )}
          </g>
        );
      })}

      {/* Positive rate line */}
      {(() => {
        const pts = items
          .filter((d) => d.positive_rate != null)
          .map((item) => {
            const idx = items.indexOf(item);
            const cx = PAD.left + idx * gap + gap / 2;
            const cy = PAD.top + CHART_H * (1 - (item.positive_rate ?? 0));
            return `${cx.toFixed(1)},${cy.toFixed(1)}`;
          });
        return pts.length > 1 ? (
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke="rgb(251,191,36)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.7"
          />
        ) : null;
      })()}

      {/* Legend */}
      <g>
        <rect x={PAD.left} y={H - 10} width="6" height="6" rx="1" fill="rgb(123,140,222)" fillOpacity="0.75" />
        <text x={PAD.left + 8} y={H - 5} fontSize="7.5" fill="#5a6080">评测数</text>
        <circle cx={PAD.left + 50} cy={H - 7} r="2.5" fill="rgb(251,191,36)" />
        <text x={PAD.left + 56} y={H - 5} fontSize="7.5" fill="#5a6080">好评率</text>
      </g>
    </svg>
  );
}
