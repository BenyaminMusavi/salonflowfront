"use client";

import { ChatCircleDotsIcon, PhoneIcon, QuestionIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";

const SUPPORT_PHONE_NUMBER = "+989351083631";
const SUPPORT_PHONE_DISPLAY = "0935 108 3631";

interface HelpSheetProps {
  open: boolean;
  onClose: () => void;
}

interface HelpOption {
  label: string;
  desc: string;
  icon: React.ElementType;
  disabled?: boolean;
  href?: string;
}

const OPTIONS: HelpOption[] = [
  {
    label: "پرسش‌های پرتکرار",
    desc: "به‌زودی فعال می‌شود",
    icon: QuestionIcon,
    disabled: true,
  },
  {
    label: "گفتگو",
    desc: "به‌زودی فعال می‌شود",
    icon: ChatCircleDotsIcon,
    disabled: true,
  },
  {
    label: "تماس با پشتیبانی",
    desc: SUPPORT_PHONE_DISPLAY,
    icon: PhoneIcon,
    href: `tel:${SUPPORT_PHONE_NUMBER}`,
  },
];

export default function HelpSheet({ open, onClose }: HelpSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-4 pb-4">
        <h3 className="text-base font-bold text-foreground">راهنما و پشتیبانی</h3>

        <div className="flex flex-col gap-2">
          {OPTIONS.map(({ label, desc, icon: Icon, disabled, href }) => {
            const rowClassName =
              "flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-right" +
              (disabled ? " opacity-50" : "");
            const content = (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-foreground">{label}</p>
                  <p className="text-[12px] text-foreground-muted" dir={disabled ? undefined : "ltr"}>
                    {desc}
                  </p>
                </div>
              </>
            );

            if (disabled || !href) {
              return (
                <div key={label} className={rowClassName} aria-disabled="true">
                  {content}
                </div>
              );
            }

            return (
              <a key={label} href={href} className={rowClassName}>
                {content}
              </a>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
