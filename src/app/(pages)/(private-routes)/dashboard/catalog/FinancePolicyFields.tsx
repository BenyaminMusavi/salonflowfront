"use client";

import { useState } from "react";
import { CaretDownIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { DepositMode } from "@/services/common/enums/domain-enums";
import {
  MAX_CANCELLATION_TIERS,
  type PolicyDraft,
} from "@/services/domains/catalog/utils/financePolicy";
import { cn } from "@/shared/utils/className";

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

const MODES: { mode: DepositMode; label: string }[] = [
  { mode: DepositMode.None, label: "بدون بیعانه" },
  { mode: DepositMode.FixedAmount, label: "مبلغ ثابت" },
  { mode: DepositMode.Percent, label: "درصدی" },
  { mode: DepositMode.FullPrepayment, label: "پیش‌پرداخت کامل" },
];

const MODE_HINT: Partial<Record<DepositMode, string>> = {
  [DepositMode.FixedAmount]: "از قیمت خدمت بیشتر نمی‌شود.",
  [DepositMode.Percent]: "درصدی از قیمت همان خدمت (با قیمت ویژه یا قیمت پرسنل).",
  [DepositMode.FullPrepayment]: "کل مبلغ خدمت به‌عنوان بیعانه حساب می‌شود.",
};

/** Digits (and one dot) only, Latin — what a percent field should hold. */
const cleanNumber = (v: string) =>
  v
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d.]/g, "");

function PercentInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        inputMode="decimal"
        dir="ltr"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(cleanNumber(e.target.value))}
        className="rounded-[12px] pe-8"
      />
      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-foreground-muted">٪</span>
    </div>
  );
}

/** «بیعانه»: none / fixed amount / percent / full prepayment. */
export function DepositFields({
  value,
  onChange,
}: {
  value: PolicyDraft;
  onChange: (next: PolicyDraft) => void;
}) {
  const hint = MODE_HINT[value.mode];
  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-background-secondary p-4">
      <span className="text-sm font-semibold text-foreground">بیعانه</span>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            className={chip(value.mode === m.mode)}
            onClick={() => onChange({ ...value, mode: m.mode })}
          >
            {m.label}
          </button>
        ))}
      </div>
      {value.mode === DepositMode.FixedAmount ? (
        <MoneyInput
          placeholder="مبلغ بیعانه"
          value={value.amount}
          onValueChange={(amount) => onChange({ ...value, amount })}
          className="rounded-[12px]"
        />
      ) : null}
      {value.mode === DepositMode.Percent ? (
        <PercentInput
          placeholder="درصد بیعانه"
          value={value.percent}
          onChange={(percent) => onChange({ ...value, percent })}
        />
      ) : null}
      {hint ? <p className="text-xs text-foreground-muted">{hint}</p> : null}
    </div>
  );
}

/** «جریمه‌ی لغو و مراجعه‌نکردن»: up to 5 steps «کمتر از N ساعت مانده ← X٪» + the no-show percent. */
export function CancellationFields({
  value,
  onChange,
}: {
  value: PolicyDraft;
  onChange: (next: PolicyDraft) => void;
}) {
  const [open, setOpen] = useState(value.tiers.length > 0 || value.noShow !== "");

  const setTier = (index: number, patch: Partial<PolicyDraft["tiers"][number]>) =>
    onChange({
      ...value,
      tiers: value.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    });

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 self-start px-1 text-xs font-semibold text-foreground-muted"
      >
        جریمه‌ی لغو و مراجعه‌نکردن
        {value.tiers.length > 0 ? ` (${value.tiers.length} پله)` : ""}
        <CaretDownIcon size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="flex flex-col gap-3 rounded-[16px] bg-background-secondary p-4">
          <p className="text-xs leading-6 text-foreground-muted">
            اگر مشتری نزدیک به نوبت لغو کند، درصدی از مبلغ پرداخت‌شده (بیعانه) نزد سالن می‌ماند. لغو توسط سالن همیشه
            بدون جریمه است. بدون پله، لغو همیشه رایگان است.
          </p>
          {value.tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-foreground-muted">کمتر از</span>
              <Input
                inputMode="numeric"
                dir="ltr"
                aria-label="ساعت مانده"
                placeholder="24"
                value={t.hours}
                onChange={(e) => setTier(i, { hours: cleanNumber(e.target.value).replace(/\./g, "") })}
                className="w-16 rounded-[12px] text-center"
              />
              <span className="shrink-0 text-xs text-foreground-muted">ساعت مانده ←</span>
              <PercentInput
                placeholder="50"
                value={t.percent}
                onChange={(percent) => setTier(i, { percent })}
                className="w-24"
              />
              <button
                type="button"
                aria-label="حذف پله"
                onClick={() => onChange({ ...value, tiers: value.tiers.filter((_, j) => j !== i) })}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
          {value.tiers.length < MAX_CANCELLATION_TIERS ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, tiers: [...value.tiers, { hours: "", percent: "" }] })}
              className="flex items-center gap-1 self-start px-1 text-xs font-semibold text-primary"
            >
              <PlusIcon size={12} weight="bold" />
              افزودن پله
            </button>
          ) : null}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-foreground">جریمه‌ی مراجعه‌نکردن</span>
            <PercentInput
              placeholder="پیش‌فرض: سخت‌ترین پله"
              value={value.noShow}
              onChange={(noShow) => onChange({ ...value, noShow })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
