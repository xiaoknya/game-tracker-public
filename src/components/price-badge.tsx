import type { GamePrice } from "@/lib/api";
import { steamPriceLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PriceBadge({
  price,
  compact = false,
  mutedWhenUnknown = false,
  hideWhenUnknown = false,
  isFreeFallback = false,
  className,
}: {
  price: GamePrice | null | undefined;
  compact?: boolean;
  mutedWhenUnknown?: boolean;
  hideWhenUnknown?: boolean;
  isFreeFallback?: boolean;
  className?: string;
}) {
  const label = !price && isFreeFallback ? "免费" : steamPriceLabel(price, "待定");
  const discount = price?.discount_percent && price.discount_percent > 0 ? price.discount_percent : null;
  const isFree = Boolean(price?.is_free || (!price && isFreeFallback));
  const isKnown = Boolean(isFree || (price && price.is_available));

  if (hideWhenUnknown && !isKnown) return null;

  return (
    <span
      title={price ? `${price.region_code}${price.currency ? ` · ${price.currency}` : ""}` : "暂无价格数据"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold leading-none",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]",
        isFree
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : discount
            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
            : isKnown
              ? "border-[#7b8cde]/35 bg-[#7b8cde]/12 text-[#c4ccff]"
              : mutedWhenUnknown
                ? "border-[#2a2d3e] bg-white/[0.03] text-[#5a6080]"
                : "border-[#2a2d3e] bg-white/[0.05] text-[#8a91aa]",
        className,
      )}
    >
      {discount ? <span>-{discount}%</span> : null}
      <span>{label}</span>
    </span>
  );
}

export function hasDisplayablePrice(price: GamePrice | null | undefined, isFreeFallback = false) {
  return Boolean(price?.is_free || (price && price.is_available) || (!price && isFreeFallback));
}
