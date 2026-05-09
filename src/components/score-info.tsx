"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";

const DIMS = [
  {
    name: "Followers",
    weight: "45%",
    s: "> 80,000",
    a: "≥ 15,000",
    b: "其余",
  },
  {
    name: "7 日增长",
    weight: "25%",
    s: "≥ 5,000；或 距发售≥90天 且 ≥2,000；或 周增速≥15% 且 ≥500",
    a: "≥ 1,000；或 距发售≤30天 且 ≥500；或 周增速≥8% 且 ≥300",
    b: "其余",
  },
  {
    name: "B 站视频",
    weight: "15%",
    s: "≥1个 >100万播放",
    a: "≥1个 >20万播放",
    b: "其余",
  },
  {
    name: "Reddit",
    weight: "10%",
    s: "≥ 20,000 成员",
    a: "≥ 3,000 成员",
    b: "其余",
  },
  {
    name: "MOD 空间",
    weight: "5%",
    s: "沙盒 / 开放世界",
    a: "RPG / 动作",
    b: "其余",
  },
];

export function ScoreInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="查看评分体系"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#5a6080] transition hover:bg-[#1c1f35] hover:text-[#a0a8c0]"
      >
        <Info className="size-3.5" />
        评分体系
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-[420px] max-w-[90vw] overflow-hidden rounded-xl border border-[#2a2d3e] bg-[#0f1117] shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="border-b border-[#2a2d3e] px-4 py-3">
            <p className="text-sm font-semibold text-[#e0e4f0]">评分体系说明</p>
            <p className="mt-0.5 text-[11px] text-[#5a6080]">
              综合分 = 各维度得分（S=3 / A=2 / B=1）× 权重 × 10/3，满分 10.0
            </p>
          </div>

          {/* Dimension table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1e2235] text-left text-[#5a6080]">
                  <th className="px-3 py-2 font-normal">维度</th>
                  <th className="px-3 py-2 font-normal">权重</th>
                  <th className="px-3 py-2 font-normal">
                    <span className="rounded bg-amber-400/15 px-1.5 text-amber-300">S</span>
                  </th>
                  <th className="px-3 py-2 font-normal">
                    <span className="rounded bg-emerald-400/15 px-1.5 text-emerald-300">A</span>
                  </th>
                  <th className="px-3 py-2 font-normal">
                    <span className="rounded bg-sky-400/15 px-1.5 text-sky-300">B</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {DIMS.map((d) => (
                  <tr key={d.name} className="border-b border-[#1e2235] text-[#a0a8c0] last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#d9def0]">{d.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#7b8cde]">{d.weight}</td>
                    <td className="px-3 py-2 leading-relaxed">{d.s}</td>
                    <td className="px-3 py-2 leading-relaxed">{d.a}</td>
                    <td className="px-3 py-2 leading-relaxed">{d.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rating thresholds */}
          <div className="border-t border-[#2a2d3e] px-4 py-3">
            <p className="mb-2 text-[11px] text-[#5a6080]">综合评级阈值</p>
            <div className="flex gap-3">
              {[
                { label: "S", range: "≥ 8.0", cls: "bg-rose-400/15 text-rose-300 border-rose-400/30" },
                { label: "A", range: "≥ 5.5", cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
                { label: "B", range: "≥ 4.0", cls: "bg-sky-400/15 text-sky-300 border-sky-400/30" },
                { label: "C", range: "< 4.0", cls: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
              ].map(({ label, range, cls }) => (
                <div key={label} className={`rounded-lg border px-3 py-1.5 text-center ${cls}`}>
                  <div className="text-base font-bold">{label}</div>
                  <div className="text-[10px] opacity-80">{range}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
