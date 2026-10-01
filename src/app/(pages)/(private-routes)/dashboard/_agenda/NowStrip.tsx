"use client";

import { CheckCircleIcon, ClockIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { cn } from "@/shared/utils/className";
import { formatClock } from "./AgendaRow";
import { formatMinutes, serviceNames, type NowState } from "./agendaUtils";

/** Show «مشتری رسید» on the next appointment only once it is this close. */
const CHECK_IN_WINDOW_MINUTES = 30;

const smallButton =
  "h-9 shrink-0 rounded-[12px] px-3 text-xs font-semibold transition-colors disabled:opacity-50";

/**
 * Today's one-line «الان»: who is late, else who is next, else that the day is over.
 * The only place on the page with a button on a row — it is literally the next thing to do.
 */
export function NowStrip({
  state,
  busy,
  onOpen,
  onCheckIn,
  onNoShow,
}: {
  state: NowState;
  busy: boolean;
  onOpen: (item: IAgendaItem) => void;
  onCheckIn: (item: IAgendaItem) => void;
  onNoShow: (item: IAgendaItem) => void;
}) {
  if (state.kind === "done") {
    return (
      <div className="flex items-center gap-2 rounded-[16px] bg-background-secondary px-4 py-3 text-sm text-foreground-muted">
        <CheckCircleIcon size={18} weight="duotone" className="text-success" />
        نوبت‌های امروز تمام شد.
      </div>
    );
  }

  const { item, minutes } = state;
  const late = state.kind === "late";
  const title = late
    ? `${formatMinutes(minutes)} تأخیر`
    : minutes === 0
      ? "نوبت بعدی · همین حالا"
      : `نوبت بعدی · ${formatMinutes(minutes)} دیگر`;
  const detail = [formatClock(item.startTime), serviceNames(item), item.staffNames]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[16px] px-4 py-3",
        late ? "bg-warning-background" : "bg-surface-brand"
      )}
    >
      <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-right">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold",
            late ? "text-warning-foreground" : "text-content-brand"
          )}
        >
          {late ? <WarningCircleIcon size={14} weight="bold" /> : <ClockIcon size={14} weight="bold" />}
          {title}
        </span>
        <span className="mt-1 block truncate text-[15px] font-bold text-foreground">
          {item.customerName || "مشتری"}
        </span>
        <span className="block truncate text-xs text-foreground-muted">{detail}</span>
      </button>
      {late ? (
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onCheckIn(item)}
            className={cn(smallButton, "bg-primary text-primary-foreground")}
          >
            رسید
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onNoShow(item)}
            className={cn(smallButton, "bg-background/40 text-foreground")}
          >
            مراجعه نکرد
          </button>
        </div>
      ) : minutes <= CHECK_IN_WINDOW_MINUTES ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => onCheckIn(item)}
          className={cn(smallButton, "bg-primary text-primary-foreground")}
        >
          مشتری رسید
        </button>
      ) : null}
    </div>
  );
}
