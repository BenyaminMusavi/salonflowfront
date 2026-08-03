"use client";

import {
  PhoneIcon,
  ChatDotsIcon,
  MapPinIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";

interface SalonsDetailActionButtonsProps {
  phone?: string | null;
  whatsappNumber?: string | null;
  websiteUrl?: string | null;
}

export default function SalonsDetailActionButtons({
  phone,
  whatsappNumber,
  websiteUrl,
}: SalonsDetailActionButtonsProps) {
  const actions = [
    {
      icon: PhoneIcon,
      label: "تماس",
      href: phone ? `tel:${phone}` : undefined,
    },
    {
      icon: ChatDotsIcon,
      label: "پیام",
      href: whatsappNumber
        ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
        : undefined,
    },
    {
      icon: MapPinIcon,
      label: "مسیریابی",
      href: websiteUrl || undefined,
    },
    {
      icon: SquaresFourIcon,
      label: "خدمات",
      href: undefined,
    },
  ];

  return (
    <div className="px-safe-area mt-6">
      <div className="flex gap-3">
        {actions.map(({ icon: Icon, label, href }, index) => {
          const className = cn(
            "flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 transition-colors",
            index === 0 ? "bg-primary" : "bg-surface-tertiary",
            !href && index < 3 ? "opacity-50" : ""
          );

          const content = (
            <>
              <Icon
                size={22}
                className={cn(
                  index === 0 ? "text-primary-foreground" : "text-foreground"
                )}
                weight={index === 0 ? "fill" : "regular"}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  index === 0 ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {label}
              </span>
            </>
          );

          if (href) {
            return (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <button key={label} type="button" className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
