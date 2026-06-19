"use client";

import {
  ChatCircleDots,
  Wallet,
  ChartLineUp,
  Envelope,
} from "@phosphor-icons/react";

const actions = [
  { title: "راهنما", desc: "اینجا کمک هست", icon: ChatCircleDots },
  { title: "کیف پول", desc: "پرداخت آسان", icon: Wallet },
  { title: "فعالیت‌ها", desc: "تاریخچه فعالیت", icon: ChartLineUp },
  { title: "پیام‌ها", desc: "چت کن", icon: Envelope },
];

export default function ProfileQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 px-safe-area">
      {actions.map(({ title, desc, icon: Icon }) => (
        <button
          key={title}
          type="button"
          className="flex flex-col items-start gap-2 rounded-[16px] bg-surface p-4 text-right"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
            <Icon size={20} className="text-primary" />
          </div>
          <h3 className="text-[14px] font-bold text-foreground">{title}</h3>
          <p className="text-[12px] text-foreground-muted">{desc}</p>
        </button>
      ))}
    </div>
  );
}
