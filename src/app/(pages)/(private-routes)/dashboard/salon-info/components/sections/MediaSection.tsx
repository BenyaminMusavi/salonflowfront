"use client";

import { ImageIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";

function MediaSlot({
  label,
  hint,
}: {
  label: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <button
        type="button"
        disabled
        className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed border-border bg-foreground/5 text-foreground-muted"
      >
        <ImageIcon size={22} />
        <span className="text-xs">{hint}</span>
      </button>
    </div>
  );
}

export default function MediaSection() {
  return (
    <section
      id="salon-media"
      className="scroll-mt-14 rounded-lg bg-surface-secondary p-3"
    >
      <h2 className="mb-3 text-sm font-bold text-foreground">رسانه</h2>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <MediaSlot label="کاور" hint="آپلود کاور" />
          <MediaSlot label="لوگو / پروفایل" hint="آپلود لوگو" />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-foreground">گالری</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[2px] border border-dashed border-border bg-foreground/5 text-foreground-muted"
            >
              <PlusIcon size={18} />
              <span className="text-[10px]">افزودن</span>
            </button>
          </div>
          <p className="text-xs text-foreground-muted">
            پیش‌نمایش تصاویر فعلی پس از اتصال به داده سالن نمایش داده می‌شود.
          </p>
        </div>

        <Button type="button" disabled className="w-full">
          ذخیره رسانه
        </Button>
      </div>
    </section>
  );
}
