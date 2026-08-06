"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { ISalonWorkingHour } from "@/services/domains/salons/types/salon.type";
import { cn } from "@/shared/utils/className";
import {
  findTodayWorkingHour,
  formatHourRange,
} from "../../utils/workingHours";

interface SalonsDetailHoursProps {
  workingHours?: ISalonWorkingHour[] | null;
}

export default function SalonsDetailHours({
  workingHours,
}: SalonsDetailHoursProps) {
  const [expanded, setExpanded] = useState(false);

  if (!workingHours?.length) return null;

  const today = findTodayWorkingHour(workingHours);
  const todayLabel = today?.dayName ?? "امروز";
  const todayValue = today
    ? today.isOff
      ? "تعطیل"
      : formatHourRange(today.start, today.end)
    : null;

  return (
    <div className="mt-6 px-safe-area">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">ساعات کاری</h2>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-foreground-muted"
          aria-expanded={expanded}
        >
          {expanded ? "بستن" : "هفته کامل"}
          <CaretDownIcon
            size={14}
            className={cn(
              "transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
      </div>

      {!expanded ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
          <span className="text-sm font-medium text-primary">{todayLabel}</span>
          <span
            className={cn(
              "text-sm",
              today?.isOff ? "text-foreground-muted" : "text-foreground"
            )}
          >
            {todayValue ?? "—"}
          </span>
        </div>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-2xl bg-surface">
          {workingHours.map((row, index) => {
            const isToday =
              today != null &&
              row.dayName === today.dayName &&
              row.start === today.start &&
              row.end === today.end &&
              row.isOff === today.isOff;

            return (
              <li
                key={`${row.dayName}-${index}`}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm",
                  index > 0 && "border-t border-border",
                  isToday && "bg-surface-hover"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    isToday ? "text-primary" : "text-foreground"
                  )}
                >
                  {row.dayName}
                </span>
                <span
                  className={cn(
                    row.isOff ? "text-foreground-muted" : "text-foreground"
                  )}
                >
                  {row.isOff
                    ? "تعطیل"
                    : formatHourRange(row.start, row.end)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
