import { cn } from "@/shared/utils/className";

export function DashboardPage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[720px] flex-col gap-4 px-safe-area pb-28 pt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
