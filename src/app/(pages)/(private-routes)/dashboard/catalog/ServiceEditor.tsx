"use client";

import { useEffect, useState } from "react";
import { CaretDownIcon, TrashIcon } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { Button } from "@/shared/components/primitives/button/Button";
import { Checkbox } from "@/shared/components/primitives/checkbox/Checkbox";
import { Input } from "@/shared/components/primitives/input/Input";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { DurationPicker } from "@/shared/components/primitives/input/DurationPicker";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import {
  useMutateCatalogOfferings,
  useMutateOfferingStaff,
  useMutatePricingRules,
  useQueryOfferingStaff,
  useQueryPricingRules,
} from "@/services/domains/catalog/hooks";
import {
  PricingRuleScopeType,
  type IServiceOffering,
} from "@/services/domains/catalog/types/catalog.type";
import type { IServiceType } from "@/services/domains/service-type/types/service-type.type";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useMediaQuery } from "@/shared/hooks";
import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate, salonWallClockToUtcIso } from "@/shared/utils/salonTime";
import { isValidServiceDuration } from "@/shared/utils/serviceDuration";
import { cn } from "@/shared/utils/className";
import { InlineDateField } from "../_agenda/DayTimePicker";
import { panelSheetClass } from "../_components/panelSheet";
import { DashboardSelect } from "../_components/DashboardSelect";
import type { DashboardToastState } from "../_components/DashboardToast";
import type { ISalonStaffMember } from "../_staff/useSalonStaff";

type Branch = { branchId: number; publicId: string; name: string };

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="px-1 text-xs font-semibold text-foreground-muted">{children}</h3>;
}

/** «چه کسانی انجام می‌دهند» — toggles save at once; a person's own price/duration opens below. */
function Providers({
  offering,
  staff,
  onToast,
}: {
  offering: IServiceOffering;
  staff: ISalonStaffMember[];
  onToast: (t: DashboardToastState) => void;
}) {
  const assigned = useQueryOfferingStaff(offering.id).data?.data ?? [];
  const mutate = useMutateOfferingStaff();
  const [openId, setOpenId] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const bookable = staff.filter((s) => s.staffMemberId != null);

  const toggle = async (staffMemberId: number, on: boolean) => {
    try {
      if (on) await mutate.assign.mutateAsync({ offeringId: offering.id, body: { staffMemberId } });
      else await mutate.unassign.mutateAsync({ offeringId: offering.id, staffMemberId });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ذخیره ناموفق بود.") });
    }
  };

  const openPerson = (staffMemberId: number) => {
    const a = assigned.find((x) => x.staffMemberId === staffMemberId && x.isActive);
    setPrice(a?.customPrice ?? null);
    setDuration(a?.customDurationMinutes ?? null);
    setOpenId(openId === staffMemberId ? null : staffMemberId);
  };

  const savePerson = async (staffMemberId: number) => {
    if (duration != null && !isValidServiceDuration(duration)) {
      onToast({ type: "error", message: "مدت باید مضرب 15 دقیقه باشد." });
      return;
    }
    try {
      await mutate.assign.mutateAsync({
        offeringId: offering.id,
        body: { staffMemberId, customPrice: price, customDurationMinutes: duration },
      });
      setOpenId(null);
      onToast({ type: "success", message: "قیمت و مدت این نفر ذخیره شد." });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ذخیره ناموفق بود.") });
    }
  };

  if (bookable.length === 0) {
    return (
      <p className="rounded-[16px] bg-background-secondary px-4 py-3 text-xs text-foreground-muted">
        هنوز پرسنل فعالی نیست. از «سالن ← پرسنل» دعوت کنید.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
      {bookable.map((s) => {
        const a = assigned.find((x) => x.staffMemberId === s.staffMemberId && x.isActive);
        const on = !!a;
        const custom = a && (a.customPrice != null || a.customDurationMinutes != null);
        const expanded = on && openId === s.staffMemberId;
        return (
          <div key={s.publicId} className="flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3">
              <Checkbox
                checked={on}
                disabled={mutate.assign.isPending || mutate.unassign.isPending}
                onCheckedChange={(v) => void toggle(s.staffMemberId!, v === true)}
                aria-label={`${s.name} این خدمت را انجام می‌دهد`}
              />
              <button
                type="button"
                disabled={!on}
                onClick={() => openPerson(s.staffMemberId!)}
                className="flex min-w-0 flex-1 items-center gap-2 text-right"
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-semibold", on ? "text-foreground" : "text-foreground-muted")}>
                    {s.name}
                  </span>
                  {on ? (
                    <span className="block truncate text-xs tabular-nums text-foreground-muted">
                      {custom
                        ? `${formatToman(a!.customPrice ?? offering.basePrice)} تومان · ${a!.customDurationMinutes ?? offering.durationMinutes} دقیقه`
                        : "قیمت و مدت پیش‌فرض"}
                    </span>
                  ) : null}
                </span>
                {on ? (
                  <CaretDownIcon size={14} className={cn("shrink-0 text-foreground-muted transition-transform", expanded && "rotate-180")} />
                ) : null}
              </button>
            </div>
            {expanded ? (
              <div className="flex flex-col gap-3 px-4 pb-4">
                <MoneyInput
                  placeholder={`قیمت ${s.name} (پیش‌فرض ${formatToman(offering.basePrice)})`}
                  value={price}
                  onValueChange={setPrice}
                  className="rounded-[12px]"
                />
                <DurationPicker label={`مدت ${s.name}`} optional value={duration} onChange={setDuration} />
                <Button
                  type="button"
                  size="sm"
                  className="self-start rounded-[12px]"
                  isLoading={mutate.assign.isPending}
                  onClick={() => void savePerson(s.staffMemberId!)}
                >
                  ذخیره برای {s.name}
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** «قیمت ویژه»: a different price in one branch, or for a limited period (e.g. a discount). */
function SpecialPrices({
  offering,
  branches,
  onToast,
  onDelete,
}: {
  offering: IServiceOffering;
  branches: Branch[];
  onToast: (t: DashboardToastState) => void;
  onDelete: (ruleId: number, label: string) => void;
}) {
  const rules = (useQueryPricingRules().data?.data ?? []).filter(
    (r) => r.serviceTypeId === offering.serviceTypeId && r.scopeType !== PricingRuleScopeType.StaffSpecific
  );
  const mutate = useMutatePricingRules();
  const [adding, setAdding] = useState(false);
  const multiBranch = branches.length > 1;
  const [kind, setKind] = useState<"period" | "branch">("period");
  const [branchId, setBranchId] = useState<number | "">("");
  const [price, setPrice] = useState<number | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const describe = (r: (typeof rules)[number]) => {
    const where =
      r.scopeType === PricingRuleScopeType.BranchSpecific
        ? `شعبه ${branches.find((b) => b.branchId === r.branchId)?.name ?? ""}`
        : "همه‌ی شعبه‌ها";
    const dates = [r.validFrom, r.validTo]
      .map((d) => (d ? formatSalonDate(d, { day: "numeric", month: "long" }) : null))
      .filter(Boolean)
      .join(" تا ");
    return [where, dates].filter(Boolean).join(" · ");
  };

  const add = async () => {
    if (price == null || price < 0) return onToast({ type: "error", message: "قیمت را وارد کنید." });
    if (kind === "branch" && !branchId) return onToast({ type: "error", message: "شعبه را انتخاب کنید." });
    if (kind === "period" && !from && !to) return onToast({ type: "error", message: "حداقل یکی از تاریخ‌ها را انتخاب کنید." });
    try {
      await mutate.create.mutateAsync({
        serviceTypeId: offering.serviceTypeId,
        serviceOfferingId: offering.id,
        scopeType: kind === "branch" ? PricingRuleScopeType.BranchSpecific : PricingRuleScopeType.Standard,
        branchId: kind === "branch" ? Number(branchId) : null,
        price,
        validFrom: from ? salonWallClockToUtcIso(from, "00:00") : null,
        validTo: to ? salonWallClockToUtcIso(to, "23:59") : null,
      });
      setAdding(false);
      setPrice(null);
      setFrom("");
      setTo("");
      onToast({ type: "success", message: "قیمت ویژه ثبت شد." });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ثبت قیمت ویژه ناموفق بود.") });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {rules.length > 0 ? (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold tabular-nums text-foreground">
                  {formatToman(r.price)} تومان
                </span>
                <span className="block truncate text-xs text-foreground-muted">{describe(r)}</span>
              </span>
              <button
                type="button"
                aria-label="حذف قیمت ویژه"
                onClick={() => onDelete(r.id, `${formatToman(r.price)} تومان · ${describe(r)}`)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {adding ? (
        <div className="flex flex-col gap-3 rounded-[16px] bg-background-secondary p-4">
          {multiBranch ? (
            <div className="flex gap-2">
              <button type="button" className={chip(kind === "period")} onClick={() => setKind("period")}>
                بازه‌ی زمانی
              </button>
              <button type="button" className={chip(kind === "branch")} onClick={() => setKind("branch")}>
                یک شعبه
              </button>
            </div>
          ) : null}
          {kind === "branch" ? (
            <DashboardSelect value={branchId} onChange={(e) => setBranchId(Number(e.target.value) || "")}>
              <option value="">انتخاب شعبه</option>
              {branches.map((b) => (
                <option key={b.publicId} value={b.branchId}>
                  {b.name}
                </option>
              ))}
            </DashboardSelect>
          ) : null}
          <MoneyInput placeholder="قیمت ویژه" value={price} onValueChange={setPrice} className="rounded-[12px]" />
          {/* Stacked: each field opens a full-width calendar under itself. */}
          <div className="flex flex-col gap-2">
            <InlineDateField label="از" value={from} onChange={setFrom} />
            <InlineDateField label="تا" value={to} onChange={setTo} />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" className="rounded-[12px]" isLoading={mutate.create.isPending} onClick={() => void add()}>
              ثبت قیمت ویژه
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
              انصراف
            </Button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="self-start px-1 text-xs font-semibold text-primary">
          ＋ قیمت ویژه
        </button>
      )}
    </div>
  );
}

/**
 * One service: what it costs and takes, who does it (and at what price each), special prices.
 * Creating shows only the basics; after the first save the same sheet continues with providers.
 */
export function ServiceEditor({
  open,
  offering,
  serviceTypes,
  usedServiceTypeNames,
  branches,
  staff,
  onOpenChange,
  onCreated,
  onRequestDelete,
  onRequestDeleteRule,
  onToast,
}: {
  open: boolean;
  offering: IServiceOffering | null;
  serviceTypes: IServiceType[];
  usedServiceTypeNames: Set<string>;
  branches: Branch[];
  staff: ISalonStaffMember[];
  onOpenChange: (open: boolean) => void;
  onCreated: (offeringId: number) => void;
  onRequestDelete: (offering: IServiceOffering) => void;
  onRequestDeleteRule: (ruleId: number, label: string) => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const mutations = useMutateCatalogOfferings();
  const editing = !!offering;
  const [serviceTypePublicId, setServiceTypePublicId] = useState("");
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(45);
  const [deposit, setDeposit] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [branchId, setBranchId] = useState<number | "">("");
  const [color, setColor] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setServiceTypePublicId("");
    setBasePrice(offering?.basePrice ?? null);
    setDuration(offering?.durationMinutes ?? 45);
    setDeposit(offering?.depositAmount ?? null);
    setActive(offering?.isActive ?? true);
    setBranchId(offering?.branchId ?? "");
    setColor(offering?.color ?? "");
    setMoreOpen(false);
    setError("");
  }, [open, offering]);


  const save = async () => {
    if (!editing && !serviceTypePublicId) return setError("نوع خدمت را انتخاب کنید.");
    if (basePrice == null || basePrice < 0) return setError("قیمت را وارد کنید.");
    if (!isValidServiceDuration(duration)) return setError("مدت باید مضرب 15 دقیقه و حداکثر 12 ساعت باشد.");
    setError("");
    const body = {
      branchId: branchId ? Number(branchId) : null,
      durationMinutes: duration!,
      basePrice,
      bufferBeforeMinutes: offering?.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: offering?.bufferAfterMinutes ?? 0,
      isOnlineBookable: offering?.isOnlineBookable ?? true,
      requiresDeposit: (deposit ?? 0) > 0,
      depositAmount: (deposit ?? 0) > 0 ? deposit : null,
      color: color || null,
    };
    try {
      if (offering) {
        await mutations.update.mutateAsync({ id: offering.id, body });
        if (active !== offering.isActive) await mutations.patchActive.mutateAsync({ id: offering.id, isActive: active });
        onToast({ type: "success", message: "خدمت ذخیره شد." });
        onOpenChange(false);
      } else {
        const res = await mutations.create.mutateAsync({ ...body, serviceTypePublicId });
        onToast({ type: "success", message: "خدمت اضافه شد. حالا مشخص کنید چه کسانی انجامش می‌دهند." });
        const id = (res as { data?: { id?: number } })?.data?.id;
        if (id) onCreated(id);
        else onOpenChange(false);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "ذخیره‌ی خدمت ناموفق بود."));
    }
  };

  const busy = mutations.create.isPending || mutations.update.isPending || mutations.patchActive.isPending;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isDesktop ? "left" : "bottom"}>
      <DrawerContent className={cn("border-border bg-background", panelSheetClass(isDesktop, 460))}>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-safe-area pb-6 pt-2 lg:px-6 lg:pt-6">
          <div className="mb-4">
            <DrawerTitle className="text-base font-bold">
              {offering ? offering.serviceTypeName : "خدمت جدید"}
            </DrawerTitle>
            <DrawerDescription className="sr-only">قیمت، مدت و پرسنل این خدمت</DrawerDescription>
          </div>

          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3">
              {!editing ? (
                <DashboardSelect value={serviceTypePublicId} onChange={(e) => setServiceTypePublicId(e.target.value)}>
                  <option value="">نوع خدمت</option>
                  {serviceTypes.map((t) => (
                    <option key={String(t.id)} value={String(t.id)} disabled={usedServiceTypeNames.has(t.name)}>
                      {t.name}
                    </option>
                  ))}
                </DashboardSelect>
              ) : null}
              <MoneyInput placeholder="قیمت پایه" value={basePrice} onValueChange={setBasePrice} className="rounded-[12px]" />
              <DurationPicker label="مدت" value={duration} onChange={setDuration} />
              <MoneyInput placeholder="بیعانه (اختیاری)" value={deposit} onValueChange={setDeposit} className="rounded-[12px]" />
              {editing ? (
                <label className="flex items-center justify-between gap-3 rounded-[16px] bg-background-secondary px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-foreground">قابل رزرو</span>
                    <span className="block text-xs text-foreground-muted">خاموش یعنی در رزرو آنلاین و سریع دیده نمی‌شود.</span>
                  </span>
                  <Switch checked={active} onCheckedChange={setActive} />
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1 self-start px-1 text-xs font-semibold text-foreground-muted"
              >
                بیشتر (رنگ، شعبه)
                <CaretDownIcon size={12} className={cn("transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen ? (
                <div className="flex flex-col gap-3">
                  {branches.length > 1 ? (
                    <DashboardSelect value={branchId} onChange={(e) => setBranchId(Number(e.target.value) || "")}>
                      <option value="">همه‌ی شعبه‌ها</option>
                      {branches.map((b) => (
                        <option key={b.publicId} value={b.branchId}>
                          فقط {b.name}
                        </option>
                      ))}
                    </DashboardSelect>
                  ) : null}
                  <label className="flex items-center justify-between gap-3 text-sm text-foreground">
                    رنگ در تقویم
                    <Input type="color" value={color || "#4fa39a"} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 rounded-[12px] p-1" />
                  </label>
                </div>
              ) : null}
              {error ? <p className="text-xs text-error">{error}</p> : null}
              <Button type="button" className="w-full rounded-[12px]" isLoading={busy} onClick={() => void save()}>
                {editing ? "ذخیره" : "افزودن خدمت"}
              </Button>
            </section>

            {offering ? (
              <>
                <section className="flex flex-col gap-2">
                  <SectionTitle>چه کسانی انجام می‌دهند</SectionTitle>
                  <Providers offering={offering} staff={staff} onToast={onToast} />
                </section>
                <section className="flex flex-col gap-2">
                  <SectionTitle>قیمت ویژه</SectionTitle>
                  <SpecialPrices
                    offering={offering}
                    branches={branches}
                    onToast={onToast}
                    onDelete={onRequestDeleteRule}
                  />
                </section>
                <button
                  type="button"
                  onClick={() => onRequestDelete(offering)}
                  className="self-center py-2 text-sm font-semibold text-error"
                >
                  حذف این خدمت
                </button>
              </>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
