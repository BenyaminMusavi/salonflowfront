import { cn } from "@/shared/utils/className";
import type { Icon } from "@phosphor-icons/react";

export function AdminKpiCard({
  title,
  value,
  icon: IconComp,
  tone = "default",
}: {
  title: string;
  value: number | string;
  icon: Icon;
  tone?: "default" | "warning" | "error";
}) {
  const toneClass =
    tone === "warning"
      ? "bg-warning-background text-warning"
      : tone === "error"
        ? "bg-error-background text-error"
        : "bg-primary/10 text-primary";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", toneClass)}>
        <IconComp size={22} weight="duotone" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-foreground-muted">{title}</p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
        </p>
      </div>
    </div>
  );
}
