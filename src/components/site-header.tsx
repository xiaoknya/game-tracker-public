import Link from "next/link";
import { Activity, CalendarDays, Disc3 } from "lucide-react";

const nav = [
  { href: "/", label: "热度榜" },
  { href: "/calendar", label: "发售日历" },
  { href: "/released", label: "已发售" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-teal-300 text-[#071014]">
            <Disc3 className="size-5" />
          </span>
          <span className="font-semibold tracking-[0.18em] text-white">GAME TRACKER</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-xs text-white/45">
          <Activity className="size-4 text-teal-200" />
          <span className="hidden sm:inline">Public beta</span>
          <CalendarDays className="size-4 md:hidden" />
        </div>
      </div>
    </header>
  );
}
