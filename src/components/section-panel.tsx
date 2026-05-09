export function SectionPanel({
  title,
  count,
  subtitle,
  actions,
  children,
}: {
  title: string;
  count: number;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <div className="flex flex-col gap-3 rounded-t-lg border border-[#2a2d3e] bg-[#1a1d2e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#e0e4f0]">{title}</span>
          <span className="rounded-full bg-[#0f1117] px-2 py-0.5 text-xs text-[#7b8cde]">{count}</span>
          {subtitle ? <span className="text-xs text-[#7a8099]">{subtitle}</span> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="rounded-b-lg border-x border-b border-[#2a2d3e] bg-[#11141f] p-4">
        {children}
      </div>
    </section>
  );
}

export function FilterChip({
  href,
  active,
  children,
  tone,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  tone?: "s" | "a" | "b" | "c";
}) {
  const activeTone =
    tone === "s"
      ? "border-rose-400 bg-rose-400 text-[#0f1117]"
      : tone === "a"
        ? "border-amber-300 bg-amber-300 text-[#0f1117]"
        : tone === "b"
          ? "border-sky-400 bg-sky-400 text-[#0f1117]"
          : tone === "c"
            ? "border-[#a0a8c8] bg-[#a0a8c8] text-[#0f1117]"
            : "border-[#7b8cde] bg-[#7b8cde] text-white";

  return (
    <a
      href={href}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? activeTone
          : "border-[#2a2d3e] bg-transparent text-[#a0a8c0] hover:bg-[#202437]"
      }`}
    >
      {children}
    </a>
  );
}

