"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Button } from "@/shared/components/primitives/button/Button";
import { useQueryAdminSalons } from "@/services/domains/admin/hooks/useQueryAdminSalons";
import { SalonApprovalStatus } from "@/services/common/enums/domain-enums";
import { formatAdminDate } from "@/services/domains/admin/utils/admin-salon-display";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminEmptyState } from "../_components/AdminEmptyState";
import { SalonDetailDrawer } from "./components/SalonDetailDrawer";

export default function SalonsPendingView() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
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
    approvalStatus: SalonApprovalStatus.Pending,
    search: search || undefined,
  });

  const result = data?.data;
  const items = result?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">تایید سالن‌های جدید</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          سالن‌هایی که در انتظار بررسی و تایید برای ورود به پلتفرم هستند.
        </p>
      </div>

      <div className="max-w-sm">
        <Input
          startIcon={<MagnifyingGlassIcon size={18} />}
          placeholder="جستجو بر اساس نام سالن…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست سالن‌ها با خطا مواجه شد.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">نام سالن</th>
                <th className="px-4 py-3 font-semibold">مالک</th>
                <th className="px-4 py-3 font-semibold">شماره تماس</th>
                <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
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
                      title="سالن در انتظار تاییدی وجود ندارد"
                      description="همهٔ درخواست‌های ثبت سالن بررسی شده‌اند."
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
                    <td className="px-4 py-3 text-foreground-muted" dir="ltr">
                      {salon.ownerPhone}
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
                        مشاهده و بررسی
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
