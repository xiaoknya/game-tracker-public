import type { Score } from "@/lib/api";

const W = 220;
const H = 220;
const CX = W / 2;
const CY = H / 2;
const R = 78;
const N = 5;

/** Angle for axis i, starting from top */
const axisAngle = (i: number) => (i * 2 * Math.PI) / N - Math.PI / 2;

function polarToXY(r: number, angle: number) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function gridPolygon(level: number) {
  return Array.from({ length: N }, (_, i) => {
    const p = polarToXY(R * level, axisAngle(i));
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(" ");
}

const MAX_SCORE = 4.5;

export function RadarChart({ latestScore }: { latestScore: Score | undefined }) {
  const axes: { label: string; value: number | null | undefined }[] = [
    { label: "Followers", value: latestScore?.score_followers },
    { label: "Bilibili", value: latestScore?.score_bilibili },
    { label: "MOD", value: latestScore?.score_mod },
    { label: "Reddit", value: latestScore?.score_reddit ?? latestScore?.score_baidu },
    { label: "增长", value: latestScore?.score_growth },
  ];

  const valuePoints = axes.map((axis, i) => {
    const v = Math.min(Math.max(Number(axis.value ?? 0), 0), MAX_SCORE);
    return polarToXY((v / MAX_SCORE) * R, axisAngle(i));
  });
  const valuePath = valuePoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px] mx-auto select-none" role="img" aria-label="score radar">
      {/* Grid rings */}
      {levels.map((level) => (
        <polygon
          key={level}
          points={gridPolygon(level)}
          fill="none"
          stroke="#2a2d3e"
          strokeWidth={level === 1 ? 1.5 : 1}
        />
      ))}

      {/* Axis spokes */}
      {axes.map((_, i) => {
        const outer = polarToXY(R, axisAngle(i));
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={outer.x.toFixed(2)}
            y2={outer.y.toFixed(2)}
            stroke="#2a2d3e"
            strokeWidth="1"
          />
        );
      })}

      {/* Value fill polygon */}
      <polygon
        points={valuePath}
        fill="rgba(123,140,222,0.18)"
        stroke="rgb(123,140,222)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Value dots */}
      {valuePoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r="3" fill="rgb(123,140,222)" />
      ))}

      {/* Axis labels */}
      {axes.map((axis, i) => {
        const p = polarToXY(R + 20, axisAngle(i));
        const value = Number(axis.value ?? 0).toFixed(1);
        return (
          <g key={i}>
            <text
              x={p.x.toFixed(2)}
              y={(p.y - 5).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize="9"
              fill="#7a8099"
            >
              {axis.label}
            </text>
            <text
              x={p.x.toFixed(2)}
              y={(p.y + 7).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize="9"
              fill="#a0a8c0"
              fontFamily="monospace"
            >
              {axis.value != null ? value : "—"}
            </text>
          </g>
        );
      })}

      {/* Center: total score */}
      {latestScore?.total_score != null && (
        <>
          <text x={CX} y={CY - 7} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#e0e4f0" fontFamily="monospace">
            {latestScore.total_score.toFixed(1)}
          </text>
          <text x={CX} y={CY + 9} textAnchor="middle" fontSize="8" fill="#5a6080">
            总分
          </text>
        </>
      )}
    </svg>
  );
}
