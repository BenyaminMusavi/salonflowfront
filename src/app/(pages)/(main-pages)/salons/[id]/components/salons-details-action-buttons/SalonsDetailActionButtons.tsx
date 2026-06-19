"use client";

import {
  PhoneIcon,
  ChatDotsIcon,
  MapPinIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";

const actions = [
  { icon: PhoneIcon, label: "تماس" },
  { icon: ChatDotsIcon, label: "پیام" },
  { icon: MapPinIcon, label: "مسیریابی" },
  { icon: SquaresFourIcon, label: "خدمات" },
];

export default function SalonsDetailActionButtons() {
  return (
    <div className="px-safe-area mt-6">
      <div className="flex gap-3">
        {actions.map(({ icon: Icon, label }, index) => (
          <button
            key={label}
            type="button"
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 transition-colors",
              index === 0 ? "bg-primary" : "bg-surface-tertiary",
            )}
          >
            <Icon
              size={22}
              className={cn(
                index === 0 ? "text-primary-foreground" : "text-foreground",
              )}
              weight={index === 0 ? "fill" : "regular"}
            />
            <span
              className={cn(
                "text-xs font-medium",
                index === 0 ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
