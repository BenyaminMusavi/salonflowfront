"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";

interface FavoriteHeartButtonProps {
  isFavorite?: boolean;
  disabled?: boolean;
  pending?: boolean;
  onToggle?: () => void;
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
  return (
    <button
      type="button"
      disabled={disabled || pending}
      aria-label={
        ariaLabel ??
        (isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها")
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.();
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition disabled:opacity-40",
        className
      )}
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
  );
}
