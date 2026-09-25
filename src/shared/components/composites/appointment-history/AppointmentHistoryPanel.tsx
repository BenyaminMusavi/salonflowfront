"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment-jalaali";
import DatePicker from "@/shared/components/composites/date-picker/DatePicker";
import { formatDateToGregorian } from "@/shared/components/composites/date-picker/DatePickerFormField";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import type { TPagedResult } from "@/services/common/data-types/SharedDataTypes";
import type {
  IAppointmentHistoryItem,
  IAppointmentHistoryQuery,
} from "@/services/domains/appointments/types/appointments.type";
import {
  appointmentStatusClass,
  appointmentStatusLabel,
  formatAppointmentDateTime,
} from "@/services/domains/appointments/utils/appointment-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import { APP_LOCALE } from "@/shared/utils/locale";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: number | ""; label: string }[] = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: AppointmentStatus.Scheduled, label: appointmentStatusLabel(AppointmentStatus.Scheduled) },
  { value: AppointmentStatus.CheckedIn, label: appointmentStatusLabel(AppointmentStatus.CheckedIn) },
  { value: AppointmentStatus.Completed, label: appointmentStatusLabel(AppointmentStatus.Completed) },
  { value: AppointmentStatus.Cancelled, label: appointmentStatusLabel(AppointmentStatus.Cancelled) },
  { value: AppointmentStatus.NoShow, label: appointmentStatusLabel(AppointmentStatus.NoShow) },
];

/** Filter + page state for the appointment-history endpoints; any filter change resets to page 1. */
export function useAppointmentHistoryQuery(initial: IAppointmentHistoryQuery = {}) {
  const [query, setQuery] = useState<IAppointmentHistoryQuery>({
    page: 1,
    pageSize: PAGE_SIZE,
    ...initial,
  });

  const setFilter = (patch: Omit<IAppointmentHistoryQuery, "page" | "pageSize">) =>
    setQuery((q) => ({ ...q, ...patch, page: 1 }));
  const setPage = (page: number) => setQuery((q) => ({ ...q, page }));

  return { query, setFilter, setPage };
}

function toJalaliDisplay(gregorian?: string): string {
  if (!gregorian) return "";
  const parsed = moment(gregorian, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.format("jYYYY/jMM/jDD") : "";
}

type Fields = {
  salon?: boolean;
  customer?: boolean;
  staff?: boolean;
};

export function AppointmentHistoryPanel({
  query,
  onFilterChange,
  onPageChange,
  result,
  isLoading,
  isFetching,
  error,
  fields = { salon: true, staff: true },
  itemHref,
  emptyState,
  idPrefix,
}: {
  query: IAppointmentHistoryQuery;
  onFilterChange: (patch: Omit<IAppointmentHistoryQuery, "page" | "pageSize">) => void;
  onPageChange: (page: number) => void;
  result?: TPagedResult<IAppointmentHistoryItem>;
  isLoading: boolean;
  isFetching?: boolean;
  error?: unknown;
  /** Which party columns to show — e.g. hide `salon` inside one salon's dashboard. */
  fields?: Fields;
  itemHref?: (item: IAppointmentHistoryItem) => string | undefined;
  emptyState?: React.ReactNode;
  /** Unique prefix for the date-picker `name`s when several panels share a page. */
  idPrefix: string;
}) {
  const items = result?.items ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          name={`${idPrefix}-from`}
          label="از تاریخ"
          placeholder="انتخاب تاریخ"
          value={toJalaliDisplay(query.from)}
          onChange={(next) =>
            onFilterChange({ from: next ? formatDateToGregorian(next) : undefined })
          }
        />
        <DatePicker
          name={`${idPrefix}-to`}
          label="تا تاریخ"
          placeholder="انتخاب تاریخ"
          value={toJalaliDisplay(query.to)}
          onChange={(next) =>
            onFilterChange({ to: next ? formatDateToGregorian(next) : undefined })
          }
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map((opt) => {
          const active = (query.status ?? "") === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() =>
                onFilterChange({ status: opt.value === "" ? undefined : opt.value })
              }
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground-muted"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <p className="text-sm text-foreground-muted">در حال بارگذاری…</p>
      )}

      {!isLoading && error != null && (
        <p className="text-sm text-error">
          {getApiErrorMessage(error, "خطا در دریافت نوبت‌ها")}
        </p>
      )}

      {!isLoading && error == null && items.length === 0 && (
        emptyState ?? (
          <div className="rounded-[20px] bg-surface p-6 text-center">
            <p className="text-sm text-foreground-muted">نوبتی پیدا نشد.</p>
          </div>
        )
      )}

      <div className={cn("flex flex-col gap-3", isFetching && !isLoading && "opacity-60")}>
        {items.map((item) => (
          <AppointmentHistoryRow
            key={item.id}
            item={item}
            fields={fields}
            href={itemHref?.(item)}
          />
        ))}
      </div>

      {result && (result.hasNext || result.hasPrevious) && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            disabled={!result.hasPrevious || isFetching}
            onClick={() => onPageChange(result.page - 1)}
            className="rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            قبلی
          </button>
          <span className="text-xs text-foreground-muted">
            صفحه {result.page.toLocaleString(APP_LOCALE)} از{" "}
            {result.totalPages.toLocaleString(APP_LOCALE)}
          </span>
          <button
            type="button"
            disabled={!result.hasNext || isFetching}
            onClick={() => onPageChange(result.page + 1)}
            className="rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}

function AppointmentHistoryRow({
  item,
  fields,
  href,
}: {
  item: IAppointmentHistoryItem;
  fields: Fields;
  href?: string;
}) {
  const title = fields.salon
    ? item.salonName
    : fields.customer
      ? item.customerName
      : item.services?.map((s) => s.name).join("، ");
  const serviceNames = item.services?.map((s) => s.name).join("، ");

  const body = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-foreground">
          {title || "—"}
        </p>
        <p className="mt-1 text-xs text-foreground-muted">
          {formatAppointmentDateTime(item.startTime)}
          {item.branchName ? ` · ${item.branchName}` : ""}
        </p>
        {serviceNames && title !== serviceNames && (
          <p className="mt-1 truncate text-xs text-foreground-muted">{serviceNames}</p>
        )}
        {fields.staff && item.staffNames && (
          <p className="mt-1 text-xs text-foreground-muted">پرسنل: {item.staffNames}</p>
        )}
        {fields.salon && fields.customer && item.customerName && (
          <p className="mt-1 text-xs text-foreground-muted">مشتری: {item.customerName}</p>
        )}
        <p className="mt-1 text-xs text-foreground-muted">
          {item.totalDurationMinutes.toLocaleString(APP_LOCALE)} دقیقه ·{" "}
          {formatToman(item.totalPrice)} تومان
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          appointmentStatusClass(item.status)
        )}
      >
        {appointmentStatusLabel(item.status)}
      </span>
    </div>
  );

  const className = "rounded-[20px] bg-surface p-4";
  return href ? (
    <Link href={href} className={cn(className, "transition hover:bg-surface-tertiary")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
