import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { appointmentStatusLabel } from "@/services/domains/appointments/utils/appointment-display";
import { cn } from "@/shared/utils/className";

export function appointmentStatusChipClass(status: number): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return "bg-warning-background text-warning";
    case AppointmentStatus.CheckedIn:
      return "bg-primary/15 text-primary";
    case AppointmentStatus.Completed:
      return "bg-success-background text-success";
    case AppointmentStatus.Cancelled:
      return "bg-foreground/10 text-foreground-muted";
    case AppointmentStatus.NoShow:
      return "bg-error-background text-error";
    default:
      return "bg-foreground/10 text-foreground-muted";
  }
}

export function DashboardStatusChip({
  status,
  label,
  className,
}: {
  status?: number;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        status != null
          ? appointmentStatusChipClass(status)
          : "bg-foreground/10 text-foreground-muted",
        className
      )}
    >
      {label}
    </span>
  );
}

export function AppointmentStatusChip({ status }: { status: number }) {
  return (
    <DashboardStatusChip
      status={status}
      label={appointmentStatusLabel(status)}
    />
  );
}
