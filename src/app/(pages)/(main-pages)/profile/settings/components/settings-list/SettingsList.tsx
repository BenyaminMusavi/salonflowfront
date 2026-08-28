"use client";

import Link from "next/link";
import {
  CaretLeft,
  House,
  Briefcase,
  ShareNetwork,
  Shield,
  Phone,
  ShieldCheck,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

interface SettingsItem {
  label: string;
  icon: React.ElementType;
  href?: string;
}

const appSettings: SettingsItem[] = [
  { label: "افزودن خانه", icon: House },
  { label: "افزودن محل کار", icon: Briefcase },
  { label: "میانبرها", icon: ShareNetwork },
  { label: "حریم خصوصی", icon: Shield },
  { label: "ارتباطات", icon: Phone },
];

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

export default function SettingsList() {
  return (
    <div className="flex flex-col gap-6 px-safe-area">
      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-foreground-muted">
          تنظیمات برنامه
        </h2>
        <div className="flex flex-col gap-2">
          {appSettings.map((item) => (
            <SettingsRow key={item.label} {...item} />
          ))}
        </div>
      </section>

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
    </div>
  );
}
