"use client";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[2px] bg-foreground/10 ${className ?? ""}`}
    />
  );
}

function SectionSkeleton({
  titleWidth = "w-28",
  rows = 3,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-4">
      <Pulse className={`mb-3 h-4 ${titleWidth}`} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Pulse key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function SalonInfoSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="در حال بارگذاری">
      <SectionSkeleton titleWidth="w-24" rows={2} />
      <SectionSkeleton titleWidth="w-32" rows={3} />
      <div className="rounded-[20px] border border-border bg-surface p-4">
        <Pulse className="mb-3 h-4 w-16" />
        <div className="grid grid-cols-2 gap-3">
          <Pulse className="h-28 w-full" />
          <Pulse className="h-28 w-full" />
        </div>
        <Pulse className="mt-3 h-20 w-full" />
        <Pulse className="mt-3 h-12 w-full" />
      </div>
      <SectionSkeleton titleWidth="w-28" rows={4} />
    </div>
  );
}
