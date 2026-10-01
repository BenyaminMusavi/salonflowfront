import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/shared/utils/className";

export function DashboardPage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[720px] flex-col gap-4 px-safe-area pb-28 pt-2 lg:pb-10",
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
  backHref,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Parent page (e.g. the «سالن» hub) — renders a back arrow before the title. */
  backHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="بازگشت"
            className="-ms-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface-hover"
          >
            <ArrowRightIcon size={18} />
          </Link>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-foreground-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
