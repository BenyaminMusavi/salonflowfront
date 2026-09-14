"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/className";
import { AdminDateField } from "../_components/AdminDateField";
import { PromoPerformanceTab } from "./components/PromoPerformanceTab";
import { ReferralPerformanceTab } from "./components/ReferralPerformanceTab";

const TABS = [
  { id: "promo", label: "کدهای تخفیف" },
  { id: "referral", label: "معرفی (رفرال)" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PlatformReportsView() {
  const [tab, setTab] = useState<TabId>("promo");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">گزارش‌های عملکرد پلتفرم</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          عملکرد کدهای تخفیف و برنامهٔ معرفی در کل پلتفرم.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
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

        <div className="mr-auto flex items-end gap-2">
          <AdminDateField
            name="platform-reports-from"
            label="از"
            value={from}
            onChange={setFrom}
            className="w-36"
          />
          <AdminDateField
            name="platform-reports-to"
            label="تا"
            value={to}
            onChange={setTo}
            className="w-36"
          />
        </div>
      </div>

      {tab === "promo" ? (
        <PromoPerformanceTab from={from} to={to} />
      ) : (
        <ReferralPerformanceTab from={from} to={to} />
      )}
    </div>
  );
}
