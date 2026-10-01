"use client";

import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { appointmentStatusLabel } from "@/services/domains/appointments/utils/appointment-display";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { formatSalonTime } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { durationMinutes, serviceNames } from "./agendaUtils";

export function formatClock(iso: string): string {
  try {
    return formatSalonTime(iso, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const DOT: Record<number, string> = {
  [AppointmentStatus.Scheduled]: "bg-foreground-muted",
  [AppointmentStatus.CheckedIn]: "bg-primary",
  [AppointmentStatus.Completed]: "bg-success",
  [AppointmentStatus.Cancelled]: "bg-foreground-disabled",
  [AppointmentStatus.NoShow]: "bg-error",
};

/** Status as a small dot + word — quieter than a pill in a long list. */
export function StatusMark({ status, className }: { status: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-foreground-muted", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[status] ?? "bg-foreground-muted")} />
      {appointmentStatusLabel(status)}
    </span>
  );
}

/**
 * One appointment in the timeline: time · customer · service · staff · status.
 * The whole row opens the details; it carries no buttons of its own.
 */
export function AgendaRow({
  item,
  showBranch,
  namesLoading,
  onOpen,
}: {
  item: IAgendaItem;
  showBranch: boolean;
  namesLoading?: boolean;
  onOpen: (item: IAgendaItem) => void;
}) {
  const status = Number(item.status);
  const muted =
    status === AppointmentStatus.Completed ||
    status === AppointmentStatus.Cancelled ||
    status === AppointmentStatus.NoShow;
  const meta = [serviceNames(item) || "بدون خدمت", item.staffNames, showBranch ? item.branchName : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-right transition-colors hover:bg-surface-hover",
        status === AppointmentStatus.CheckedIn && "bg-surface-brand"
      )}
    >
      <span className="w-12 shrink-0 pt-0.5">
        <span
          className={cn(
            "block text-[15px] font-bold tabular-nums text-foreground",
            muted && "text-foreground-muted"
          )}
        >
          {formatClock(item.startTime)}
        </span>
        <span className="block text-[11px] text-foreground-muted">
          {durationMinutes(item)} دقیقه
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[15px] font-bold text-foreground",
            muted && "text-foreground-muted",
            status === AppointmentStatus.Cancelled && "line-through"
          )}
        >
          {item.customerName ||
            (namesLoading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-surface-hover align-middle" />
            ) : (
              "مشتری"
            ))}
        </span>
        <span className="mt-0.5 block truncate text-xs text-foreground-muted">{meta}</span>
      </span>
      <StatusMark status={status} className="shrink-0 pt-1" />
    </button>
  );
}
