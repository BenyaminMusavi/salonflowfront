"use client";

import { useMemo, useState } from "react";
import { CopyIcon, NavigationArrowIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import {
  buildDirectionOptions,
  hasValidCoordinates,
  IDirectionsTarget,
} from "@/shared/utils/directions";

interface SalonsDetailDirectionsSheetProps {
  open: boolean;
  onClose: () => void;
  target: IDirectionsTarget;
}

export default function SalonsDetailDirectionsSheet({
  open,
  onClose,
  target,
}: SalonsDetailDirectionsSheetProps) {
  const [copied, setCopied] = useState<"done" | "failed" | null>(null);

  const options = useMemo(
    () =>
      open
        ? buildDirectionOptions(target, typeof navigator === "undefined" ? "" : navigator.userAgent)
        : [],
    [open, target]
  );
  const exact = hasValidCoordinates(target.latitude, target.longitude);
  const address = target.address?.trim();

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  };

  const handleClose = () => {
    setCopied(null);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-base font-bold text-foreground">مسیریابی تا {target.label}</h3>
        {address ? <p className="text-sm text-foreground-muted">{address}</p> : null}

        {!exact ? (
          <p className="rounded-[12px] bg-background-secondary p-3 text-xs text-foreground-muted">
            موقعیت دقیق این سالن روی نقشه ثبت نشده است؛ جست‌وجو بر اساس متن آدرس انجام می‌شود و
            ممکن است دقیق نباشد.
          </p>
        ) : null}

        {options.map((option) => (
          <a
            key={option.id}
            href={option.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-sm font-bold text-foreground"
          >
            <NavigationArrowIcon size={18} className="text-primary" />
            {option.label}
          </a>
        ))}

        {address ? (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-right text-sm font-bold text-foreground"
          >
            <CopyIcon size={18} className="text-primary" />
            {copied === "done"
              ? "آدرس کپی شد"
              : copied === "failed"
                ? "کپی نشد؛ آدرس را دستی انتخاب کنید"
                : "کپی آدرس"}
          </button>
        ) : null}

        {options.length === 0 && !address ? (
          <p className="text-sm text-foreground-muted">برای این سالن آدرسی ثبت نشده است.</p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
