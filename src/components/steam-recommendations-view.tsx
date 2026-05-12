"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, LogIn, RefreshCcw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard-card";
import { ReleasedCard } from "@/components/released-card";
import type { ReleasedGame } from "@/lib/api";

type SteamUser = {
  steamid: string;
  display_name: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  country_code: string | null;
  library_game_count: number;
  matched_library_count: number;
  library_private: boolean;
  last_synced_at: string | null;
};

type SteamMe = {
  user: SteamUser;
};

type RecommendationItem = {
  kind: "released" | "upcoming" | string;
  score: number;
  reasons: string[];
  matched_tags: string[];
  source_games: Array<{
    steam_appid: number;
    name: string;
    playtime_hours: number;
  }>;
  game: ReleasedGame;
};

type RecommendationResponse = {
  kind: "released" | "upcoming" | string;
  generated_at: string;
  library_count: number;
  matched_library_count: number;
  items: RecommendationItem[];
};

type SyncResponse = {
  user: SteamUser;
  library_count: number;
  matched_library_count: number;
  private_or_empty: boolean;
  message: string;
};

type Kind = "released" | "upcoming";

const KIND_LABEL: Record<Kind, string> = {
  released: "已发售",
  upcoming: "即将发售",
};

export function SteamRecommendationsView({ initialError }: { initialError?: string }) {
  const [me, setMe] = useState<SteamMe | null>(null);
  const [kind, setKind] = useState<Kind>("released");
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(initialError ? steamErrorLabel(initialError) : null);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      setLoadingMe(true);
      const res = await fetch("/api/steam/me", { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 401) {
        setMe(null);
        setLoadingMe(false);
        return;
      }
      if (!res.ok) {
        setMessage(await errorMessage(res, "读取 Steam 登录状态失败"));
        setLoadingMe(false);
        return;
      }
      setMe((await res.json()) as SteamMe);
      setLoadingMe(false);
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!me?.user.last_synced_at) return;
    void loadRecommendations(kind);
  }, [kind, me?.user.last_synced_at]);

  const canRecommend = Boolean(me?.user.last_synced_at && !me.user.library_private);

  const profileLabel = useMemo(() => {
    if (!me) return "";
    return me.user.display_name || `Steam 用户 ${me.user.steamid.slice(-6)}`;
  }, [me]);

  async function loadRecommendations(nextKind: Kind) {
    setLoadingRecs(true);
    setMessage(null);
    const res = await fetch(`/api/steam/recommendations?kind=${nextKind}&limit=18`, { cache: "no-store" });
    if (!res.ok) {
      setMessage(await errorMessage(res, "生成推荐失败"));
      setLoadingRecs(false);
      return;
    }
    setRecommendations((await res.json()) as RecommendationResponse);
    setLoadingRecs(false);
  }

  async function syncLibrary() {
    setSyncing(true);
    setMessage(null);
    const res = await fetch("/api/steam/sync", { method: "POST" });
    if (!res.ok) {
      setMessage(await errorMessage(res, "同步 Steam 游戏库失败"));
      setSyncing(false);
      return;
    }
    const data = (await res.json()) as SyncResponse;
    setMe({ user: data.user });
    setMessage(data.message);
    setSyncing(false);
    if (!data.private_or_empty) {
      await loadRecommendations(kind);
    }
  }

  async function logout() {
    await fetch("/api/steam/logout", { method: "POST" }).catch(() => undefined);
    setMe(null);
    setRecommendations(null);
    setMessage("已退出 Steam 登录");
  }

  async function deleteData() {
    const ok = window.confirm("确认删除已保存的 Steam 账号与游戏库数据？");
    if (!ok) return;
    const res = await fetch("/api/steam/data", { method: "DELETE" });
    if (!res.ok) {
      setMessage(await errorMessage(res, "删除数据失败"));
      return;
    }
    setMe(null);
    setRecommendations(null);
    setMessage("已删除 Steam 账号与游戏库数据");
  }

  if (loadingMe) {
    return (
      <div className="grid min-h-[52vh] place-items-center rounded-lg border border-[#2a2d3e] bg-[#151827] text-sm text-[#7a8099]">
        正在读取 Steam 登录状态
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-[#2a2d3e] bg-[#171a29] p-5 shadow-[0_12px_34px_rgba(2,6,23,0.28)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fa0ff]">
                <Sparkles className="size-4" />
                Personal Picks
              </div>
              <h1 className="mt-3 text-2xl font-bold text-[#f1f4ff] sm:text-3xl">
                连接 Steam 后，按你的真实游戏库推荐
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8b93ad]">
                系统会读取你的公开游戏库和游玩时长，把常玩的类型、题材和口味转成推荐权重，再从站内已追踪的已发售和即将发售游戏里挑选。
              </p>
            </div>
            <a
              href="/api/steam/login"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#7b8cde] px-4 text-sm font-semibold text-white transition hover:bg-[#8fa0ff]"
            >
              <LogIn className="size-4" />
              连接 Steam
            </a>
          </div>

          {message ? (
            <div className="mt-4 rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
              {message}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <IntroStat icon={<ShieldCheck className="size-4" />} title="不保存密码" text="Steam OpenID 只返回账号身份" />
            <IntroStat icon={<Database className="size-4" />} title="只读游戏库" text="用于计算偏好和推荐理由" />
            <IntroStat icon={<CheckCircle2 className="size-4" />} title="可随时删除" text="清除账号、会话和游戏库快照" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#2a2d3e] bg-[#171a29] p-4 shadow-[0_12px_34px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {me.user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.user.avatar_url} alt="" className="size-12 rounded-lg border border-white/10 bg-[#0f1117]" />
            ) : (
              <div className="grid size-12 place-items-center rounded-lg border border-white/10 bg-[#0f1117]">
                <Sparkles className="size-5 text-[#8fa0ff]" />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-lg font-bold text-[#f1f4ff]">{profileLabel}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#7a8099]">
                <span>库内 {me.user.library_game_count} 款</span>
                <span>命中站内 {me.user.matched_library_count} 款</span>
                <span>{me.user.last_synced_at ? `同步于 ${formatTime(me.user.last_synced_at)}` : "尚未同步游戏库"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={syncLibrary}
              disabled={syncing}
              className="border border-[#4a5687] bg-[#252a42] text-[#dce2ff] hover:bg-[#30375a]"
            >
              <RefreshCcw className={syncing ? "animate-spin" : ""} />
              {syncing ? "同步中" : "同步游戏库"}
            </Button>
            <Button type="button" variant="outline" onClick={logout} className="border-[#2a2d3e] bg-[#0f1117] text-[#a0a8c0]">
              退出
            </Button>
            <Button type="button" variant="destructive" onClick={deleteData}>
              <Trash2 />
              删除数据
            </Button>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-md border border-[#2a2d3e] bg-[#0f1117] px-3 py-2 text-sm text-[#a0a8c0]">
            {message}
          </div>
        ) : null}
      </section>

      <section>
        <div className="flex flex-col gap-3 rounded-t-lg border border-[#2a2d3e] bg-[#1a1d2e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#e0e4f0]">为你推荐</span>
            <span className="rounded-full bg-[#0f1117] px-2 py-0.5 text-xs text-[#7b8cde]">
              {recommendations?.items.length ?? 0}
            </span>
            <span className="text-xs text-[#7a8099]">基于游戏库、游玩时长、站内热度与口碑</span>
          </div>
          <div className="flex gap-2">
            {(["released", "upcoming"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setKind(item)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  kind === item
                    ? "border-[#7b8cde] bg-[#7b8cde] text-white"
                    : "border-[#2a2d3e] bg-transparent text-[#a0a8c0] hover:bg-[#202437]"
                }`}
              >
                {KIND_LABEL[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-b-lg border-x border-b border-[#2a2d3e] bg-[#11141f] p-3 sm:p-4">
          {!canRecommend ? (
            <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[#2a2d3e] px-4 text-center text-sm text-[#7a8099]">
              <div>
                <div className="font-semibold text-[#dce2f4]">先同步一次 Steam 游戏库</div>
                <div className="mt-2 max-w-md leading-6">
                  如果你的 Steam 游戏详情是私密状态，接口会读不到游戏库；公开后重新点击同步即可。
                </div>
              </div>
            </div>
          ) : loadingRecs ? (
            <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
              正在生成 {KIND_LABEL[kind]} 推荐
            </div>
          ) : recommendations?.items.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {recommendations.items.map((item) => (
                <RecommendationCard key={`${item.kind}-${item.game.id}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[#2a2d3e] text-sm text-[#7a8099]">
              暂时没有可推荐的 {KIND_LABEL[kind]} 游戏
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-[#25283a] bg-[#171a29]">
      <div className="relative">
        <div className="absolute right-2 top-2 z-20 rounded-full border border-white/15 bg-[#05070d]/80 px-2 py-1 text-[11px] font-bold text-[#dce2ff] backdrop-blur">
          {item.score.toFixed(0)}
        </div>
        {item.kind === "released" ? (
          <ReleasedCard game={item.game} />
        ) : (
          <div className="p-2">
            <DashboardCard game={item.game} />
          </div>
        )}
      </div>
      <div className="space-y-2 border-t border-[#25283a] p-3">
        <div className="flex flex-wrap gap-1">
          {item.matched_tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded bg-[#0f1117] px-1.5 py-0.5 text-[11px] text-[#8fa0ff]">
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {item.reasons.map((reason) => (
            <div key={reason} className="line-clamp-1 text-[12px] text-[#8b93ad]">
              {reason}
            </div>
          ))}
        </div>
        {item.source_games.length ? (
          <div className="border-t border-[#25283a] pt-2 text-[11px] text-[#5f6783]">
            来自：
            {item.source_games.map((source, index) => (
              <span key={source.steam_appid}>
                {index > 0 ? "、" : ""}
                {source.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function IntroStat({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-[#25283a] bg-[#0f1117] p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#dce2f4]">
        <span className="text-[#8fa0ff]">{icon}</span>
        {title}
      </div>
      <div className="mt-1 text-xs leading-5 text-[#7a8099]">{text}</div>
    </div>
  );
}

async function errorMessage(res: Response, fallback: string) {
  const data = (await res.json().catch(() => null)) as { detail?: string; message?: string } | null;
  return data?.detail || data?.message || fallback;
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function steamErrorLabel(code: string) {
  if (code === "invalid_state") return "Steam 登录状态校验失败，请重新连接";
  if (code === "network") return "连接 Steam 登录服务失败，请稍后再试";
  return `Steam 登录失败：${code}`;
}
