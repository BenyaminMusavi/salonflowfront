import { cn } from "@/shared/utils/className";

export function AdminSelectFilter({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-lg border border-input-border bg-input px-3 text-xs font-medium text-foreground",
        "hover:bg-input-hover focus:border-border-strong focus:outline-none focus:inset-ring-2 focus:inset-ring-primary",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
