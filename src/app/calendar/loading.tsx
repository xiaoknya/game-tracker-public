import { AppShell } from "@/components/app-shell";

export default function CalendarLoading() {
  return (
    <AppShell activePath="/calendar">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-5 w-24 rounded bg-[#252840]" />
          <div className="h-4 w-8 rounded bg-[#1e2133]" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-[#2a2d3e] bg-[#1a1d2e]">
            <div className="border-b border-[#2a2d3e] px-4 py-3">
              <div className="h-3 w-16 rounded bg-[#1e2133]" />
              <div className="mt-1.5 h-5 w-24 rounded bg-[#252840]" />
            </div>
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="border-b border-[#2a2d3e] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-20 rounded bg-[#1e2133]" />
                  <div className="h-4 w-4 rounded bg-[#1e2133]" />
                  <div className="h-4 w-40 rounded bg-[#252840]" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
