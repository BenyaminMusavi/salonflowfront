"use client";

import { useState } from "react";
import {
  ArrowBendDownRightIcon,
  PaperPlaneRightIcon,
} from "@phosphor-icons/react";

const tabs = ["تکمیل شده", "در انتظار", "انتقالات"] as const;
type Tab = (typeof tabs)[number];

const transactions = [
  {
    type: "خرید" as const,
    icon: ArrowBendDownRightIcon,
    color: "text-success",
    subtitle: "از 0x4200c90",
    amount: "10 BTC",
    fiat: "۵۶۰,۹۵۰ تومان",
  },
  {
    type: "ارسال" as const,
    icon: PaperPlaneRightIcon,
    color: "text-info",
    subtitle: "از 0x4200c90",
    amount: "2.155 ETH",
    fiat: "۱,۰۵۰,۴۰ تومان",
  },
];

export default function WalletTransactionHistory() {
  const [activeTab, setActiveTab] = useState<Tab>("تکمیل شده");

  return (
    <div className={"px-safe-area"}>
      <div className="bg-surface px-3 py-5">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {transactions.map((tx, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-[16px] bg-background-secondary p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-tertiary">
                <tx.icon size={18} className={tx.color} weight="bold" />
              </div>

              <div className="flex-1">
                <p className="text-[14px] font-bold text-foreground">
                  {tx.type}
                </p>
                <p className="text-[12px] text-foreground-muted">
                  {tx.subtitle}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-foreground">
                  {tx.amount}
                </p>
                <p className="text-[12px] text-foreground-muted">{tx.fiat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
