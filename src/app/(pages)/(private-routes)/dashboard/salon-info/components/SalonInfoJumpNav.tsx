"use client";

import { cn } from "@/shared/utils/className";

export const SALON_INFO_SECTIONS = [
  { id: "salon-profile", label: "پایه و تماس" },
  { id: "salon-media", label: "رسانه" },
  { id: "salon-branches", label: "شعبه‌ها" },
] as const;

interface SalonInfoJumpNavProps {
  activeId: string;
  onJump: (id: string) => void;
  /** Section ids with unsaved local changes — shown as a small dot on the pill. */
  dirtyIds?: string[];
}

export default function SalonInfoJumpNav({
  activeId,
  onJump,
  dirtyIds,
}: SalonInfoJumpNavProps) {
  return (
    <nav
      aria-label="بخش‌های اطلاعات سالن"
      className="sticky top-[3.25rem] z-10 -mx-safe-area border-b border-border bg-background/95 px-safe-area py-2 backdrop-blur"
    >
      <div className="flex gap-2 overflow-x-auto">
        {SALON_INFO_SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          const isDirty = dirtyIds?.includes(section.id);
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onJump(section.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground-muted"
              )}
            >
              {section.label}
              {isDirty && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    isActive ? "bg-primary-foreground" : "bg-warning"
                  )}
                  aria-label="تغییرات ذخیره‌نشده"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
