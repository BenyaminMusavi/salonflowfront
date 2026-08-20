import { cn } from "@/shared/utils/className";
import { DashboardCard } from "./DashboardCard";

export function DashboardKpi({
  title,
  value,
  hint,
  className,
}: {
  title: string;
  value: string;
  hint?: string | null;
  className?: string;
}) {
  return (
    <DashboardCard className={cn("p-3", className)}>
      <p className="text-xs text-foreground-muted">{title}</p>
      <p className="mt-1 text-base font-bold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 text-[11px] text-foreground-muted">{hint}</p>
      ) : null}
    </DashboardCard>
  );
}
