"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/className";
import { SubscriptionsListTab } from "./components/SubscriptionsListTab";
import { InvoicesListTab } from "./components/InvoicesListTab";
import { PlansListTab } from "./components/PlansListTab";
import { PromoCodesListTab } from "./components/PromoCodesListTab";

const TABS = [
  { id: "plans", label: "طرح‌ها" },
  { id: "subscriptions", label: "اشتراک‌ها" },
  { id: "invoices", label: "فاکتورها" },
  { id: "promos", label: "کدهای تخفیف" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SubscriptionsView() {
  const [tab, setTab] = useState<TabId>("plans");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">اشتراک و صورتحساب</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          مدیریت طرح‌های اشتراک و تخفیف‌شان، اشتراک مالکان سالن‌ها و ثبت پرداخت فاکتورهای پلتفرمی.
        </p>
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-semibold transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "plans" ? (
        <PlansListTab />
      ) : tab === "subscriptions" ? (
        <SubscriptionsListTab />
      ) : tab === "invoices" ? (
        <InvoicesListTab />
      ) : (
        <PromoCodesListTab />
      )}
    </div>
  );
}
