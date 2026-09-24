"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useQueryCustomers } from "@/services/domains/customers/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { Input } from "@/shared/components/primitives/input/Input";
import { RouteAddress } from "@/shared/data/routeAddress";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardEmptyState,
  DashboardSkeleton,
} from "../_components";

/** Salon customers (SalonOwner/Staff) — each row opens that customer's appointments in this salon. */
export default function CustomersView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, error } = useQueryCustomers(search, page);
  const result = data?.data;
  const customers = result?.items ?? [];

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="مشتریان"
        description="برای دیدن رزروهای هر مشتری در این سالن، روی او بزنید."
      />

      <Input
        type="search"
        placeholder="جستجو با نام یا شماره موبایل"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {isLoading ? (
        <DashboardSkeleton cards={1} rows={5} />
      ) : error ? (
        <p className="text-sm text-error">
          {getApiErrorMessage(error, "خطا در دریافت مشتریان")}
        </p>
      ) : customers.length === 0 ? (
        <DashboardEmptyState
          title={search ? "مشتری‌ای پیدا نشد" : "هنوز مشتری‌ای ندارید"}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {customers.map((c) => (
            <Link
              key={c.publicId ?? c.id}
              href={RouteAddress.DASHBOARD.CUSTOMER_APPOINTMENTS(c.publicId)}
              className="flex items-center justify-between gap-3 rounded-[16px] bg-surface p-4 transition hover:bg-surface-tertiary"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {c.fullName || "بدون نام"}
                </p>
                <p className="mt-1 text-xs text-foreground-muted" dir="ltr">
                  {c.phone}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                رزروها
                <CaretLeftIcon size={14} />
              </span>
            </Link>
          ))}
        </div>
      )}

      {result && (result.hasNext || result.hasPrevious) && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!result.hasPrevious || isFetching}
            onClick={() => setPage(result.page - 1)}
            className="rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            قبلی
          </button>
          <span className="text-xs text-foreground-muted">
            صفحه {result.page.toLocaleString("fa-IR")} از{" "}
            {result.totalPages.toLocaleString("fa-IR")}
          </span>
          <button
            type="button"
            disabled={!result.hasNext || isFetching}
            onClick={() => setPage(result.page + 1)}
            className="rounded-full bg-surface px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      )}
    </DashboardPage>
  );
}
