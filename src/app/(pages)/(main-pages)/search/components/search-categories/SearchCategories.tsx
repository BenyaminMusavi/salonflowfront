"use client";

const categories = [
  { label: "مو و آرایشگری", color: "bg-gradient-to-br from-border-hover to-background-elevated" },
  { label: "رنگ مو", color: "bg-gradient-to-br from-border-strong to-border" },
  { label: "تاتو و پیرسینگ", color: "bg-gradient-to-br from-border-hover to-background-secondary" },
  { label: "آرایش", color: "bg-gradient-to-br from-border-strong to-background-elevated" },
  { label: "ماساژ", color: "bg-gradient-to-br from-border-hover to-border" },
];

export default function SearchCategories() {
  return (
    <div className="px-safe-area">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">دسته‌بندی‌ها</h2>
        <button type="button" className="text-[13px] text-primary">
          مشاهده همه
        </button>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto">
        {categories.map((cat, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2">
            <div
              className={`h-[68px] w-[68px] rounded-full ${cat.color}`}
            />
            <span className="w-[68px] truncate text-center text-[11px] text-foreground-muted">
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
