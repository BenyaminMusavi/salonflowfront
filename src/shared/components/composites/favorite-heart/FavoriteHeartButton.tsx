"use client";

import { useState } from "react";
import { HeartIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

interface FavoriteHeartButtonProps {
  isFavorite?: boolean;
  disabled?: boolean;
  pending?: boolean;
  onToggle?: () => void | Promise<void>;
  className?: string;
  iconClassName?: string;
  size?: number;
  ariaLabel?: string;
}

export default function FavoriteHeartButton({
  isFavorite = false,
  disabled = false,
  pending = false,
  onToggle,
  className,
  iconClassName,
  size = 22,
  ariaLabel,
}: FavoriteHeartButtonProps) {
  const [error, setError] = useState("");

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled || pending}
        title={error || undefined}
        aria-label={
          ariaLabel ??
          (isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها")
        }
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void (async () => {
            try {
              await onToggle?.();
              setError("");
            } catch (err) {
              setError(
                getApiErrorMessage(err, "ذخیره علاقه‌مندی ناموفق بود.")
              );
            }
          })();
        }}
        className="flex h-full w-full items-center justify-center rounded-full transition disabled:opacity-40"
      >
        <HeartIcon
          weight={isFavorite ? "fill" : "regular"}
          size={size}
          className={cn(
            isFavorite ? "text-error" : "text-white",
            iconClassName
          )}
        />
      </button>
      {error ? (
        <span className="absolute top-full left-1/2 z-20 mt-1 w-max max-w-[180px] -translate-x-1/2 rounded-md bg-error px-2 py-1 text-[10px] text-white">
          {error}
        </span>
      ) : null}
    </div>
  );
}
