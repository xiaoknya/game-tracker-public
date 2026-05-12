import { Bookmark, Calendar, CheckCircle2, LineChart, Sparkles, type LucideIcon } from "lucide-react";

export const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "主看板", icon: LineChart },
  { href: "/released", label: "已发售游戏", icon: CheckCircle2 },
  { href: "/calendar", label: "发售日历", icon: Calendar },
  { href: "/recommendations", label: "为我推荐", icon: Sparkles },
  { href: "/watchlist", label: "我的收藏", icon: Bookmark },
];
