import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// 思源黑体 — unified font for all text including numerics
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://game.xiaoknya.cn"),
  title: {
    default: "游戏热度追踪",
    template: "%s | 游戏热度追踪",
  },
  description: "公开版游戏热度榜、发售日历和 Steam 社区趋势。",
  openGraph: {
    title: "游戏热度追踪",
    description: "公开版游戏热度榜、发售日历和 Steam 社区趋势。",
    url: "/",
    siteName: "游戏热度追踪",
    locale: "zh_CN",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
