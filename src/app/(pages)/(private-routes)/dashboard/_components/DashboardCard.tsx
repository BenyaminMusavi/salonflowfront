import { cn } from "@/shared/utils/className";

export const dashboardCardClassName =
  "rounded-[20px] border border-border bg-surface p-4";

export function DashboardCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(dashboardCardClassName, className)} {...props}>
      {children}
    </div>
  );
}
