"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Menu } from "lucide-react";

import { navItems } from "@/components/app-nav";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar({ activePath = "/" }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = pathname || activePath;

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-[#2a2d3e] bg-[#1a1d2e] text-[#b8c0dc] transition hover:bg-[#252a42] hover:text-white lg:hidden"
        aria-label="打开导航"
      >
        <Menu className="size-4" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[236px] max-w-[82vw] gap-0 border-[#2a2d3e] bg-[#1a1d2e] p-0 text-[#e0e4f0]"
      >
        <SheetTitle className="sr-only">导航</SheetTitle>
        <Link
          href="/"
          className="relative flex h-[60px] items-center gap-2.5 border-b border-[#2a2d3e] px-3.5"
        >
          <span className="grid size-8 place-items-center rounded-md bg-[#252a42] text-[#9aa8ff]">
            <Gamepad2 className="size-5" />
          </span>
          <span className="whitespace-nowrap text-sm font-bold text-[#e0e4f0]">游戏热度追踪</span>
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#7b8cde] to-transparent opacity-60" />
        </Link>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));

            return (
              <SheetClose
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className={`mb-1 flex h-10 items-center gap-3 rounded-md px-3 text-[13px] transition ${
                      active
                        ? "bg-[#252a42] text-[#8fa0ff]"
                        : "text-[#a0a8c0] hover:bg-[#202437] hover:text-[#dce2f4]"
                    }`}
                  />
                }
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
