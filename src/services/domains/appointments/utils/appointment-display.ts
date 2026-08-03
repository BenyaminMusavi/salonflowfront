import { AppointmentStatus } from "@/services/common/enums/domain-enums";

const DEFAULT_FREE_CANCEL_HOURS = 24;

export function appointmentStatusLabel(status: number): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return "رزرو شده";
    case AppointmentStatus.Completed:
      return "انجام‌شده";
    case AppointmentStatus.Cancelled:
      return "لغو شده";
    case AppointmentStatus.NoShow:
      return "عدم حضور";
    case AppointmentStatus.CheckedIn:
      return "حضور ثبت‌شده";
    default:
      return "نامشخص";
  }
}

export function appointmentStatusClass(status: number): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return "bg-primary/15 text-primary";
    case AppointmentStatus.Completed:
      return "bg-emerald-500/15 text-emerald-400";
    case AppointmentStatus.Cancelled:
      return "bg-foreground/10 text-foreground-muted";
    case AppointmentStatus.NoShow:
      return "bg-orange-500/15 text-orange-400";
    case AppointmentStatus.CheckedIn:
      return "bg-sky-500/15 text-sky-400";
    default:
      return "bg-foreground/10 text-foreground-muted";
  }
}

export function formatAppointmentDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fa-IR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Hours remaining until startTime (negative if past). */
export function hoursUntilStart(startTime: string): number {
  const start = new Date(startTime).getTime();
  return (start - Date.now()) / (1000 * 60 * 60);
}

export function isWithinFreeCancellationWindow(
  startTime: string,
  windowHours = DEFAULT_FREE_CANCEL_HOURS
): boolean {
  return hoursUntilStart(startTime) >= windowHours;
}

export function canCustomerCancel(status: number): boolean {
  return status === AppointmentStatus.Scheduled;
}
