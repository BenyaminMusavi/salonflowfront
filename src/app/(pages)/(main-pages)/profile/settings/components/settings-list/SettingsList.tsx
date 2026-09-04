"use client";

import Link from "next/link";
import { CaretLeft, MoonIcon, ShieldCheck, SunIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { useThemeStore } from "@/services/theme-store/useThemeStore";

interface SettingsItem {
  label: string;
  icon: React.ElementType;
  href?: string;
}

// SF-QA-019: "افزودن خانه/محل کار"، "میانبرها"، "حریم خصوصی" و "ارتباطات" حذف شدند —
// هیچ صفحه‌ی مقصدی برایشان پیاده نشده بود، پس هر ردیف بی‌واکنش می‌ماند. وقتی صفحه‌ی
// مقصد هرکدام آماده شد، با href واقعی به این لیست برگردانده شوند.
const popular: SettingsItem[] = [
  {
    label: "تنظیمات امنیتی",
    icon: ShieldCheck,
    href: RouteAddress.PROFILE.CHANGE_PASSWORD,
  },
];

function SettingsRow({ label, icon: Icon, href }: SettingsItem) {
  const rowClassName =
    "flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right";
  const content = (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
        <Icon size={20} className="text-primary" />
      </div>
      <span className="flex-1 text-[14px] font-bold text-foreground">
        {label}
      </span>
      <CaretLeft size={18} className="text-foreground-muted" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={rowClassName}>
      {content}
    </button>
  );
}

function ThemeToggleRow() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isLight = theme === "light";

  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
        {isLight ? (
          <SunIcon size={20} className="text-primary" />
        ) : (
          <MoonIcon size={20} className="text-primary" />
        )}
      </div>
      <span className="flex-1 text-[14px] font-bold text-foreground">
        حالت روشن
      </span>
      <Switch
        checked={isLight}
        onCheckedChange={toggleTheme}
        aria-label="تغییر تم روشن و تاریک"
      />
    </div>
  );
}

export default function SettingsList() {
  return (
    <div className="flex flex-col gap-6 px-safe-area">
      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-foreground-muted">
          محبوب
        </h2>
        <div className="flex flex-col gap-2">
          {popular.map((item) => (
            <SettingsRow key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-foreground-muted">
          ظاهر
        </h2>
        <div className="flex flex-col gap-2">
          <ThemeToggleRow />
        </div>
      </section>
    </div>
  );
}
