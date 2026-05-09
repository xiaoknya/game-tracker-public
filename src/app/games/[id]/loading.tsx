import { AppShell } from "@/components/app-shell";

function Block({ className }: { className?: string }) {
  return <div className={`rounded bg-[#252840] ${className}`} />;
}

function Faint({ className }: { className?: string }) {
  return <div className={`rounded bg-[#1e2133] ${className}`} />;
}

export default function GameDetailLoading() {
  return (
    <AppShell activePath="/games">
      <div className="animate-pulse space-y-5">
        {/* Back link */}
        <Faint className="h-4 w-24" />

        {/* Hero card */}
        <div className="overflow-hidden rounded-lg border border-[#2a2d3e] bg-[#1a1d2e]">
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Block className="h-6 w-8" />
                <Faint className="h-6 w-20" />
                <Faint className="h-6 w-24" />
              </div>
              <Block className="h-9 w-3/4" />
              <Faint className="h-4 w-48" />
              <Faint className="h-16 w-full" />
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => <Faint key={i} className="h-5 w-14" />)}
              </div>
              <div className="flex gap-2">
                <Block className="h-9 w-24" />
                <Faint className="h-9 w-24" />
              </div>
            </div>
            <Block className="aspect-[16/9] w-full" />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {/* Metrics row */}
            <div className="grid gap-3 rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Faint className="h-3 w-16" />
                  <Block className="h-7 w-20" />
                  <Faint className="h-3 w-12" />
                </div>
              ))}
            </div>

            {/* Chart sections */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4">
                <Faint className="h-3 w-20 mb-2" />
                <Block className="h-5 w-40 mb-4" />
                <Faint className="h-40 w-full" />
              </div>
            ))}
          </div>

          <aside className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] p-4 space-y-3">
                <Block className="h-4 w-28" />
                {[1, 2, 3].map((j) => (
                  <Faint key={j} className="h-8 w-full" />
                ))}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
