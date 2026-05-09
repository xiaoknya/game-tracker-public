import { AppShell } from "@/components/app-shell";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] animate-pulse">
      <div className="aspect-[16/9] bg-[#252840]" />
      <div className="p-3 space-y-2.5">
        <div className="h-4 w-3/4 rounded bg-[#252840]" />
        <div className="h-3 w-1/2 rounded bg-[#1e2133]" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-4 w-12 rounded bg-[#1e2133]" />
          <div className="h-4 w-16 rounded bg-[#1e2133]" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-md bg-[#1e2133]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <AppShell activePath="/">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 animate-pulse">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
            <div className="h-8 w-12 rounded bg-[#252840]" />
            <div className="mt-2 h-3 w-16 rounded bg-[#1e2133]" />
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="mt-6 flex items-center gap-3 animate-pulse">
        <div className="h-5 w-24 rounded bg-[#252840]" />
        <div className="h-4 w-8 rounded bg-[#1e2133]" />
      </div>

      {/* Cards grid */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </AppShell>
  );
}
