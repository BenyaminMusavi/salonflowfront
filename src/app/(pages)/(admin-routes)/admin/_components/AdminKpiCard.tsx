import Link from "next/link";
import { cn } from "@/shared/utils/className";
import type { Icon } from "@phosphor-icons/react";
import { APP_LOCALE } from "@/shared/utils/locale";

export function AdminKpiCard({
  title,
  value,
  icon: IconComp,
  tone = "default",
  href,
}: {
  title: string;
  value: number | string;
  icon: Icon;
  tone?: "default" | "warning" | "error";
  href?: string;
}) {
  const toneClass =
    tone === "warning"
      ? "bg-warning-background text-warning"
      : tone === "error"
        ? "bg-error-background text-error"
        : "bg-primary/10 text-primary";

  const content = (
    <>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", toneClass)}>
        <IconComp size={22} weight="duotone" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-foreground-muted">{title}</p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString(APP_LOCALE) : value}
        </p>
      </div>
    </>
  );

  const className =
    "flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors";

  if (href) {
    return (
      <Link href={href} className={cn(className, "hover:border-primary/40")}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
