import Link from "next/link";
import { Calendar, CheckCircle2, Gamepad2, LineChart, Swords } from "lucide-react";

import { SearchBar } from "@/components/search-bar";

const navItems = [
  { href: "/", label: "主看板", icon: LineChart },
  { href: "/released", label: "已发售游戏", icon: CheckCircle2 },
  { href: "/calendar", label: "发售日历", icon: Calendar },
];

const pageMeta: Record<string, { title: string; sub: string; icon: React.ElementType }> = {
  "/":         { title: "主看板",     sub: "即将发售游戏评级",  icon: LineChart    },
  "/released": { title: "已发售游戏", sub: "近期上线游戏汇总",  icon: CheckCircle2 },
  "/calendar": { title: "发售日历",   sub: "按日期浏览发售计划", icon: Calendar     },
};

export function AppShell({
  children,
  activePath = "/",
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  const meta = activePath.startsWith("/games")
    ? { title: "游戏详情", sub: "Steam 数据 · 评测分析", icon: Swords }
    : pageMeta[activePath] ?? { title: "游戏热度追踪", sub: "", icon: Gamepad2 };
  const PageIcon = meta.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117] text-[#e0e4f0]">
      <aside className="hidden w-[188px] shrink-0 border-r border-[#2a2d3e] bg-[#1a1d2e] lg:flex lg:flex-col">
        <Link href="/" className="relative flex h-[60px] items-center gap-2.5 border-b border-[#2a2d3e] px-3.5">
          <span className="grid size-8 place-items-center rounded-md bg-[#252a42] text-[#9aa8ff]">
            <Gamepad2 className="size-5" />
          </span>
          <span className="whitespace-nowrap text-sm font-bold text-[#e0e4f0]">游戏热度追踪</span>
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#7b8cde] to-transparent opacity-60" />
        </Link>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex h-10 items-center gap-3 rounded-md px-3 text-[13px] transition ${
                  active
                    ? "bg-[#252a42] text-[#8fa0ff]"
                    : "text-[#a0a8c0] hover:bg-[#202437] hover:text-[#dce2f4]"
                }`}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[#2a2d3e] bg-[#141623]/95 px-4 backdrop-blur lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden size-8 shrink-0 items-center justify-center rounded-md bg-[#252a42] text-[#9aa8ff] sm:flex">
              <PageIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold leading-tight text-[#e0e4f0]">{meta.title}</div>
              {meta.sub && (
                <div className="truncate text-[11px] leading-tight text-[#5a6080]">{meta.sub}</div>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <SearchBar />
          </div>
        </header>

        <main className="flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}

export function MobileNav() {
  return (
    <nav className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="whitespace-nowrap rounded-md border border-[#2a2d3e] bg-[#1a1d2e] px-3 py-2 text-sm text-[#a0a8c0]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
