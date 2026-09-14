export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-14 text-center">
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description ? (
        <p className="text-xs text-foreground-muted">{description}</p>
      ) : null}
    </div>
  );
}
