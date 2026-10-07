"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, CaretLeftIcon, MagnifyingGlassIcon, UserPlusIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQueryCustomers } from "@/services/domains/customers/hooks";
import type { ICustomer } from "@/services/domains/customers/types/customers.type";
import { APP_LOCALE } from "@/shared/utils/locale";
import { normalizePhoneInput } from "@/shared/utils/phoneInput";
import { formatSalonDate } from "@/shared/utils/salonTime";

const PHONE_RULE = /^09\d{9}$/;

export type PickedCustomer = { phone: string; fullName: string; isNew: boolean };

/** «6 مراجعه · آخرین بار 28 شهریور» — or nothing when the list row has no stats. */
function visitLine(c: ICustomer): string | null {
  if (c.visitsCount == null) return null;
  if (!c.visitsCount) return "هنوز مراجعه‌ای ندارد";
  return [
    `${c.visitsCount.toLocaleString(APP_LOCALE)} مراجعه`,
    c.lastVisitAt ? `آخرین بار ${formatSalonDate(c.lastVisitAt, { day: "numeric", month: "long" })}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Full-panel customer search over the «نوبت جدید» sheet: the box on top, a large list that
 * scrolls on its own below it (`data-vaul-no-drag`, so a finger scrolls the list instead of
 * dragging the sheet). Empty box → the most recent customers.
 */
export function CustomerPicker({
  onPick,
  onClose,
}: {
  onPick: (customer: PickedCustomer) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Persian/Arabic digits typed into the box still match stored Latin phone numbers.
  const digits = normalizePhoneInput(search);
  const term = /^\d{3,}$/.test(digits) ? digits : debounced;
  const query = useQueryCustomers(term.length >= 2 ? term : "", 1, { sort: term ? undefined : "lastVisit" });
  const items = query.data?.data?.items ?? [];
  const canCreate = PHONE_RULE.test(digits) && !items.some((c) => c.phone === digits);
  const typing = term.length >= 2;

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-safe-area py-3 lg:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="بازگشت"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-hover"
        >
          <ArrowRightIcon size={20} />
        </button>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="نام یا موبایل مشتری"
          className="rounded-[12px]"
          startIcon={<MagnifyingGlassIcon size={18} />}
          autoComplete="off"
          // One keyboard the whole time (no switch to the number pad mid-typing).
          inputMode="text"
          enterKeyHint="search"
          autoFocus
        />
      </div>

      <div
        data-vaul-no-drag
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-safe-area pb-6 pt-3 lg:px-6"
      >
        {canCreate ? (
          <button
            type="button"
            onClick={() => onPick({ phone: digits, fullName: "", isNew: true })}
            className="mb-3 flex w-full items-center gap-3 rounded-[16px] bg-surface-brand px-4 py-3.5 text-right"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserPlusIcon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-content-brand">مشتری جدید</span>
              <span className="block text-sm text-foreground-muted" dir="ltr">
                {digits}
              </span>
            </span>
            <CaretLeftIcon size={18} className="shrink-0 text-content-brand" />
          </button>
        ) : null}

        {canCreate && items.length === 0 && !query.isLoading ? null : (
          <p className="mb-2 px-1 text-xs font-semibold text-foreground-muted">
            {typing ? "نتیجه‌ها" : "مشتری‌های اخیر"}
          </p>
        )}

        {canCreate && items.length === 0 && !query.isLoading ? null : query.isLoading && term.length >= 2 ? (
          <p className="px-1 py-4 text-sm text-foreground-muted">در حال جستجو…</p>
        ) : items.length === 0 ? (
          <p className="rounded-[16px] bg-background-secondary px-4 py-5 text-sm leading-6 text-foreground-muted">
            {typing
              ? "مشتری‌ای با این نام یا شماره پیدا نشد. برای مشتری جدید، شماره‌ی موبایلش را کامل بنویسید."
              : "هنوز مشتری‌ای ندارید. شماره‌ی موبایل مشتری را بنویسید."}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {items.map((c) => (
              <button
                key={c.publicId ?? c.id}
                type="button"
                onClick={() => onPick({ phone: c.phone, fullName: c.fullName, isNew: false })}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-surface-hover active:bg-surface-hover"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-brand text-base font-bold text-content-brand">
                  {(c.fullName || "م").charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-foreground">{c.fullName || "بدون نام"}</span>
                  <span className="block text-sm text-foreground-muted" dir="ltr" style={{ textAlign: "right" }}>
                    {c.phone}
                  </span>
                  {visitLine(c) ? <span className="block truncate text-xs text-foreground-muted">{visitLine(c)}</span> : null}
                </span>
                <CaretLeftIcon size={18} className="shrink-0 text-foreground-muted" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
