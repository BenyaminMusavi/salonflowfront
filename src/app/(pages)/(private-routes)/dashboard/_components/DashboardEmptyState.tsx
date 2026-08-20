import { cn } from "@/shared/utils/className";
import { DashboardCard } from "./DashboardCard";

export function DashboardEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <DashboardCard className={cn("text-center", className)}>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 text-xs leading-6 text-foreground-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </DashboardCard>
  );
}
