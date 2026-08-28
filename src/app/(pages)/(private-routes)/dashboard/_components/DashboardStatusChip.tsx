import { AnimatePresence, motion } from "motion/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { appointmentStatusLabel } from "@/services/domains/appointments/utils/appointment-display";
import { cn } from "@/shared/utils/className";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const chipClass = cn(
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
    status != null ? appointmentStatusChipClass(status) : "bg-foreground/10 text-foreground-muted",
    className
  );

  if (prefersReducedMotion) {
    return <span className={chipClass}>{label}</span>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status ?? "unknown"}
        className={chipClass}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {label}
      </motion.span>
    </AnimatePresence>
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
