"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { IBranchService } from "@/services/domains/salons/types/booking-browse.type";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";

interface BookServicesStepProps {
  services: IBranchService[];
  selectedServices: IBranchService[];
  isLoading?: boolean;
  onToggle: (service: IBranchService) => void;
}

export default function BookServicesStep({
  services,
  selectedServices,
  isLoading = false,
  onToggle,
}: BookServicesStepProps) {
  const multiSelected = selectedServices.length > 1;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">انتخاب خدمات</h2>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && services.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">
            خدمتی برای این شعبه تعریف نشده است.
          </p>
        </div>
      ) : null}

      {!isLoading && services.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {services.map((svc) => {
            const selected = selectedServices.some(
              (s) => s.servicePublicId === svc.servicePublicId
            );

            return (
              <li key={svc.servicePublicId}>
                <button
                  type="button"
                  onClick={() => onToggle(svc)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-right transition",
                    selected
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-surface hover:bg-surface-hover"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-input"
                    )}
                    aria-hidden
                  >
                    {selected ? <CheckIcon size={14} weight="bold" /> : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-foreground">
                        {svc.name}
                      </p>
                      <p className="shrink-0 text-sm font-bold text-foreground">
                        {formatToman(svc.price)}
                      </p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-foreground-muted">
                        {svc.durationMinutes.toLocaleString("fa-IR")} دقیقه
                      </span>
                      {svc.requiresDeposit ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                          بیعانه{" "}
                          {formatToman(svc.depositAmount ?? 0)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {multiSelected ? (
        <p className="text-xs leading-5 text-foreground-muted">
          زمان و پرسنل بر اساس خدمت اول هماهنگ می‌شود.
        </p>
      ) : null}
    </section>
  );
}
