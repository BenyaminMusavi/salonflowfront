import { DashboardCard } from "./DashboardCard";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-foreground/10 ${className ?? ""}`}
    />
  );
}

export function DashboardSkeleton({
  cards = 3,
  rows = 3,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="در حال بارگذاری"
    >
      {Array.from({ length: cards }).map((_, i) => (
        <DashboardCard key={i}>
          <Pulse className="mb-3 h-4 w-28" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: rows }).map((_, j) => (
              <Pulse key={j} className="h-12 w-full" />
            ))}
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
