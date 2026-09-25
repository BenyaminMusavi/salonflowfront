"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Button } from "@/shared/components/primitives/button/Button";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { useQueryAdminSubscriptionInvoices } from "@/services/domains/admin/hooks/useQueryAdminSubscriptionInvoices";
import { PlatformInvoiceStatus } from "@/services/common/enums/domain-enums";
import {
  platformInvoiceStatusLabel,
  platformInvoiceStatusVariant,
} from "@/services/domains/subscriptions/utils/subscription-display";
import { formatRialAsToman } from "@/services/domains/subscriptions/utils/subscription-display";
import { IAdminPlatformInvoiceListItem } from "@/services/domains/subscriptions/types/subscriptions.type";
import { AdminPagination } from "../../_components/AdminPagination";
import { AdminEmptyState } from "../../_components/AdminEmptyState";
import { AdminSelectFilter } from "../../_components/AdminSelectFilter";
import { MarkInvoicePaidDrawer } from "./MarkInvoicePaidDrawer";

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "همهٔ وضعیت‌ها" },
  { value: String(PlatformInvoiceStatus.Pending), label: "در انتظار پرداخت" },
  { value: String(PlatformInvoiceStatus.Paid), label: "پرداخت‌شده" },
  { value: String(PlatformInvoiceStatus.Cancelled), label: "لغو شده" },
  { value: String(PlatformInvoiceStatus.Expired), label: "منقضی" },
];

export function InvoicesListTab() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PlatformInvoiceStatus | undefined>();
  const [markPaidTarget, setMarkPaidTarget] =
    useState<IAdminPlatformInvoiceListItem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQueryAdminSubscriptionInvoices({
    page,
    pageSize: 20,
    status,
    search: search || undefined,
  });

  const result = data?.data;
  const items = result?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="max-w-sm flex-1">
          <Input
            startIcon={<MagnifyingGlassIcon size={18} />}
            placeholder="جستجو بر اساس شماره فاکتور یا مالک…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <AdminSelectFilter
          value={status != null ? String(status) : ""}
          onChange={(e) => {
            setStatus(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AdminSelectFilter>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست فاکتورها با خطا مواجه شد.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">شماره فاکتور</th>
                <th className="px-4 py-3 font-semibold">مالک</th>
                <th className="px-4 py-3 font-semibold">مبلغ</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <AdminEmptyState
                      title="فاکتوری با این فیلترها پیدا نشد"
                      description="فیلترها یا عبارت جستجو را تغییر دهید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border text-foreground last:border-0 hover:bg-background-secondary"
                  >
                    <td className="px-4 py-3 font-medium" dir="ltr">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p>{invoice.ownerName}</p>
                      <p className="text-[11px] text-foreground-muted" dir="ltr">
                        {invoice.ownerPhone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatRialAsToman(invoice.grandTotal)} تومان
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={platformInvoiceStatusVariant(invoice.status)}>
                        {platformInvoiceStatusLabel(invoice.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {invoice.status === PlatformInvoiceStatus.Pending ? (
                        <Button
                          size="sm"
                          onClick={() => setMarkPaidTarget(invoice)}
                        >
                          ثبت پرداخت
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {result ? (
          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            hasNext={result.hasNext}
            hasPrevious={result.hasPrevious}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <MarkInvoicePaidDrawer
        invoice={markPaidTarget}
        onClose={() => setMarkPaidTarget(null)}
      />
    </div>
  );
}
