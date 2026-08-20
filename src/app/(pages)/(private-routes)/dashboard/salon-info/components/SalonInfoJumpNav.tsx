"use client";

import { cn } from "@/shared/utils/className";

export const SALON_INFO_SECTIONS = [
  { id: "salon-basic", label: "پایه" },
  { id: "salon-contact", label: "تماس" },
  { id: "salon-media", label: "رسانه" },
  { id: "salon-branches", label: "شعبه‌ها" },
] as const;

interface SalonInfoJumpNavProps {
  activeId: string;
  onJump: (id: string) => void;
}

export default function SalonInfoJumpNav({
  activeId,
  onJump,
}: SalonInfoJumpNavProps) {
  return (
    <nav
      aria-label="بخش‌های اطلاعات سالن"
      className="sticky top-[3.25rem] z-10 -mx-safe-area border-b border-border bg-background/95 px-safe-area py-2 backdrop-blur"
    >
      <div className="flex gap-2 overflow-x-auto">
        {SALON_INFO_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onJump(section.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              activeId === section.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground-muted"
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
