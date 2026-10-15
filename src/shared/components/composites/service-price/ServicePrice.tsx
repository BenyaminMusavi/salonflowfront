import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";

/**
 * A service's effective price. When it is lower than the list price (a timed special price) the
 * list price sits struck through next to it, plus «تا {date}» while the special price has an end.
 */
export default function ServicePrice({
  price,
  basePrice,
  validTo,
  className,
}: {
  price: number;
  basePrice?: number | null;
  /** UTC ISO end of a special price. */
  validTo?: string | null;
  className?: string;
}) {
  const discounted = basePrice != null && basePrice > price;
  return (
    <span className={cn("flex flex-col items-end text-sm font-bold tabular-nums text-foreground", className)}>
      {discounted ? (
        <span className="text-xs font-medium text-foreground-muted line-through">{formatToman(basePrice)}</span>
      ) : null}
      <span>
        {formatToman(price)} <span className="text-xs font-medium text-foreground-muted">تومان</span>
      </span>
      {discounted && validTo ? (
        <span className="text-[11px] font-medium text-primary">
          تا {formatSalonDate(validTo, { day: "numeric", month: "long" })}
        </span>
      ) : null}
    </span>
  );
}
