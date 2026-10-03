"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretLeftIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQueryCustomers } from "@/services/domains/customers/hooks";
import type { ICustomer, TCustomerSegment } from "@/services/domains/customers/types/customers.type";
import { useCustomerPreviewStore } from "@/services/domains/customers/store/useCustomerPreviewStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { APP_LOCALE } from "@/shared/utils/locale";
import { normalizePhoneInput } from "@/shared/utils/phoneInput";
import { formatSalonDate, salonTodayYmd, utcToSalonYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { DashboardPage, DashboardPageHeader, DashboardSkeleton } from "../_components";

const pagerButton =
  "rounded-full bg-surface-hover px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40";

const SEGMENTS: { value: TCustomerSegment; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "new", label: "جدید" },
  { value: "inactive", label: "بدون مراجعه‌ی اخیر" },
];

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** «3 مراجعه · آخرین بار 12 مهر» — or «مشتری جدید» before the first completed visit. */
function visitLine(c: ICustomer): string | null {
  if (c.visitsCount == null) return null;
  if (!c.visitsCount) return "هنوز مراجعه‌ی انجام‌شده ندارد";
  return [
    `${c.visitsCount.toLocaleString(APP_LOCALE)} مراجعه`,
    c.lastVisitAt ? `آخرین بار ${formatSalonDate(c.lastVisitAt, { day: "numeric", month: "long" })}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** «امروز» / «12 مهر» for the next booked appointment. */
function nextLabel(iso: string): string {
  return utcToSalonYmd(iso) === salonTodayYmd() ? "امروز" : formatSalonDate(iso, { day: "numeric", month: "short" });
}

/** Salon customers — search first; a row opens that customer's page. */
export default function CustomersView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [segment, setSegment] = useState<TCustomerSegment>("all");
  const remember = useCustomerPreviewStore((s) => s.remember);

  useEffect(() => {
    const t = setTimeout(() => {
      // Persian/Arabic digits typed into the box still match stored Latin phone numbers.
      const raw = searchInput.trim();
      const digits = normalizePhoneInput(raw);
      setSearch(/^\d{3,}$/.test(digits) ? digits : raw);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, error } = useQueryCustomers(search, page, { segment });
  const result = data?.data;
  const customers = result?.items ?? [];

  return (
    <DashboardPage className="gap-3">
      <DashboardPageHeader title="مشتریان" />

      <div className="sticky top-16 z-10 -mx-1 bg-background/95 px-1 py-1 backdrop-blur">
        <Input
          type="search"
          placeholder="جستجو با نام یا شماره موبایل"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          startIcon={<MagnifyingGlassIcon size={18} />}
          className="rounded-[12px]"
        />
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {SEGMENTS.map((x) => (
            <button
              key={x.value}
              type="button"
              className={chip(segment === x.value)}
              onClick={() => {
                setSegment(x.value);
                setPage(1);
              }}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton cards={1} rows={6} />
      ) : error ? (
        <p className="text-sm text-error">{getApiErrorMessage(error, "خطا در دریافت مشتریان")}</p>
      ) : customers.length === 0 ? (
        <div className="rounded-[16px] bg-background-secondary p-8 text-center text-sm text-foreground-muted">
          {search
            ? "مشتری‌ای با این مشخصات پیدا نشد."
            : segment === "new"
              ? "در 30 روز اخیر مشتری جدیدی نداشتید."
              : segment === "inactive"
                ? "همه‌ی مشتری‌ها در 2 ماه اخیر مراجعه داشته‌اند."
                : "هنوز مشتری‌ای ندارید."}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {customers.map((c) => (
            <Link
              key={c.publicId ?? c.id}
              href={RouteAddress.DASHBOARD.CUSTOMER_APPOINTMENTS(c.publicId)}
              onClick={() => remember({ publicId: c.publicId, fullName: c.fullName, phone: c.phone })}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-brand text-sm font-bold text-content-brand">
                {(c.fullName || "م").charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-foreground">
                  {c.fullName || "بدون نام"}
                </span>
                <span className="block text-xs text-foreground-muted">
                  <span dir="ltr">{c.phone}</span>
                  {visitLine(c) ? ` · ${visitLine(c)}` : ""}
                </span>
              </span>
              {c.nextAppointmentAt ? (
                <span className="shrink-0 rounded-full bg-surface-brand px-2 py-0.5 text-[11px] font-semibold text-content-brand">
                  نوبت {nextLabel(c.nextAppointmentAt)}
                </span>
              ) : c.noShowCount ? (
                <span className="shrink-0 text-[11px] text-warning">{c.noShowCount.toLocaleString(APP_LOCALE)} بار مراجعه نکرده</span>
              ) : null}
              <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
            </Link>
          ))}
        </div>
      )}

      {result && (result.hasNext || result.hasPrevious) ? (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!result.hasPrevious || isFetching}
            onClick={() => setPage(result.page - 1)}
            className={pagerButton}
          >
            قبلی
          </button>
          <span className="text-xs text-foreground-muted">
            صفحه {result.page.toLocaleString(APP_LOCALE)} از {result.totalPages.toLocaleString(APP_LOCALE)}
          </span>
          <button
            type="button"
            disabled={!result.hasNext || isFetching}
            onClick={() => setPage(result.page + 1)}
            className={pagerButton}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </DashboardPage>
  );
}
