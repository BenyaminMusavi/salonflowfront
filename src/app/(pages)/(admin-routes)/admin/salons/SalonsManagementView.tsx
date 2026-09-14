"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Button } from "@/shared/components/primitives/button/Button";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { useQueryAdminSalons } from "@/services/domains/admin/hooks/useQueryAdminSalons";
import { SalonApprovalStatus, TrustStatus } from "@/services/common/enums/domain-enums";
import {
  formatAdminDate,
  salonApprovalStatusLabel,
  salonApprovalStatusVariant,
  trustStatusLabel,
  trustStatusVariant,
} from "@/services/domains/admin/utils/admin-salon-display";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminEmptyState } from "../_components/AdminEmptyState";
import { AdminSelectFilter } from "../_components/AdminSelectFilter";
import { SalonDetailDrawer } from "../_components/SalonDetailDrawer";

const APPROVAL_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "همهٔ وضعیت‌های تایید" },
  { value: String(SalonApprovalStatus.Pending), label: "در انتظار تایید" },
  { value: String(SalonApprovalStatus.Approved), label: "تاییدشده" },
  { value: String(SalonApprovalStatus.Rejected), label: "ردشده" },
  { value: String(SalonApprovalStatus.Draft), label: "پیش‌نویس" },
];

const TRUST_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "همهٔ وضعیت‌های اعتماد" },
  { value: String(TrustStatus.Active), label: "فعال" },
  { value: String(TrustStatus.UnderReview), label: "در حال بررسی" },
  { value: String(TrustStatus.Suspended), label: "معلق" },
];

export default function SalonsManagementView() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<SalonApprovalStatus | undefined>();
  const [trustStatus, setTrustStatus] = useState<TrustStatus | undefined>();
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQueryAdminSalons({
    page,
    pageSize: 20,
    approvalStatus,
    trustStatus,
    search: search || undefined,
  });

  const result = data?.data;
  const items = result?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">مدیریت و تعلیق سالن‌ها</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          مرور همهٔ سالن‌ها و مدیریت وضعیت اعتماد آن‌ها روی پلتفرم.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="max-w-sm flex-1">
          <Input
            startIcon={<MagnifyingGlassIcon size={18} />}
            placeholder="جستجو بر اساس نام سالن…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <AdminSelectFilter
          value={approvalStatus != null ? String(approvalStatus) : ""}
          onChange={(e) => {
            setApprovalStatus(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          {APPROVAL_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AdminSelectFilter>
        <AdminSelectFilter
          value={trustStatus != null ? String(trustStatus) : ""}
          onChange={(e) => {
            setTrustStatus(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          {TRUST_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AdminSelectFilter>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست سالن‌ها با خطا مواجه شد.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">نام سالن</th>
                <th className="px-4 py-3 font-semibold">مالک</th>
                <th className="px-4 py-3 font-semibold">وضعیت تایید</th>
                <th className="px-4 py-3 font-semibold">وضعیت اعتماد</th>
                <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <AdminEmptyState
                      title="سالنی با این فیلترها پیدا نشد"
                      description="فیلترها یا عبارت جستجو را تغییر دهید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((salon) => (
                  <tr
                    key={salon.publicId}
                    className="border-b border-border text-foreground last:border-0 hover:bg-background-secondary"
                  >
                    <td className="px-4 py-3 font-medium">{salon.name}</td>
                    <td className="px-4 py-3 text-foreground-muted">{salon.ownerName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={salonApprovalStatusVariant(salon.approvalStatus)}>
                        {salonApprovalStatusLabel(salon.approvalStatus)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={trustStatusVariant(salon.trustStatus)}>
                        {trustStatusLabel(salon.trustStatus)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatAdminDate(salon.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPublicId(salon.publicId)}
                      >
                        مشاهده
                      </Button>
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

      <SalonDetailDrawer
        publicId={selectedPublicId}
        onClose={() => setSelectedPublicId(null)}
      />
    </div>
  );
}
