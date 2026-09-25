import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { APP_LOCALE } from "@/shared/utils/locale";

export function AdminPagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
      <button
        type="button"
        disabled={!hasPrevious}
        onClick={() => onPageChange(page - 1)}
        className="flex h-8 items-center gap-1 rounded-full bg-background-secondary px-3 text-xs font-semibold text-foreground disabled:opacity-40"
      >
        <CaretRightIcon size={14} />
        قبلی
      </button>
      <span className="text-xs text-foreground-muted">
        صفحهٔ {page.toLocaleString(APP_LOCALE)} از {totalPages.toLocaleString(APP_LOCALE)}
      </span>
      <button
        type="button"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
        className="flex h-8 items-center gap-1 rounded-full bg-background-secondary px-3 text-xs font-semibold text-foreground disabled:opacity-40"
      >
        بعدی
        <CaretLeftIcon size={14} />
      </button>
    </div>
  );
}
