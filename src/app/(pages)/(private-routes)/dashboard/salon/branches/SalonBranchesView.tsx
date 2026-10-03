"use client";

import { useMemo, useState } from "react";
import { CaretDownIcon, CaretLeftIcon, PlusIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { PhoneInput } from "@/shared/components/primitives/input/PhoneInput";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonPanel, useQueryBranchRemovalImpact } from "@/services/domains/salon-panel/hooks";
import type { IBranchRequest } from "@/services/domains/salon-panel/types/salon-panel.type";
import { APP_LOCALE } from "@/shared/utils/locale";
import {
  GENDER_TYPE_OPTIONS,
  useOnboardingDraftStore,
} from "@/services/domains/salons/store/useOnboardingDraftStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import type { IOnboardingBranch } from "@/services/domains/salons/types/onboarding.type";
import { cn } from "@/shared/utils/className";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardToast,
  type DashboardToastState,
} from "../../_components";
import { dashboardQuietButtonClass } from "../../_components/buttonClasses";
import SalonInfoSkeleton from "../../salon-info/components/SalonInfoSkeleton";
import {
  createEmptyBranch,
  type BranchEditorValues,
} from "../../salon-info/components/sections/BranchEditorItem";
import { mapSalonToBranches } from "../../salon-info/utils/mapSalonToForm";

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

function toApi(branches: BranchEditorValues[]): IOnboardingBranch[] {
  return branches.map((b) => ({
    publicId: b.publicId || null,
    name: b.name.trim(),
    city: b.city.trim(),
    address: b.address.trim(),
    latitude: b.latitude,
    longitude: b.longitude,
    genderType: b.genderType,
    phone: b.phone.trim() || null,
    isActive: b.isActive,
  })) as IOnboardingBranch[];
}

function toBranchRequest(b: BranchEditorValues): IBranchRequest {
  return {
    name: b.name.trim(),
    city: b.city.trim(),
    address: b.address.trim(),
    latitude: b.latitude,
    longitude: b.longitude,
    genderType: b.genderType,
    phone: b.phone.trim() || null,
    isActive: b.isActive,
  };
}

/** Why a branch can't be removed — from the removal-impact check. */
function removalBlockers(i: { isLastActiveBranch: boolean; futureAppointmentsCount: number; staffCount: number }): string[] {
  const n = (x: number) => x.toLocaleString(APP_LOCALE);
  return [
    i.isLastActiveBranch ? "این تنها شعبه‌ی فعال سالن است." : null,
    i.futureAppointmentsCount ? `${n(i.futureAppointmentsCount)} نوبت آینده دارد؛ اول آن‌ها را جابه‌جا یا لغو کنید.` : null,
    i.staffCount ? `${n(i.staffCount)} نفر از پرسنل در این شعبه‌اند؛ اول آن‌ها را به شعبه‌ی دیگری ببرید.` : null,
  ].filter((x): x is string => !!x);
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground-muted">
      {label}
      {children}
      {error ? <span className="font-medium text-error">{error}</span> : null}
    </label>
  );
}

/** «شعبه‌ها» — list of branches; one branch is edited in a short sheet and saved at once. */
export default function SalonBranchesView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salon = useQuerySalonById(salonPublicId || undefined).data?.data;
  // Memoized: the mapper mints fresh client keys on every call.
  const branches = useMemo(() => (salon ? mapSalonToBranches(salon) : []), [salon]);
  const panel = useMutateSalonPanel();
  const setDraftBranches = useOnboardingDraftStore((s) => s.setBranches);
  const draftSalonPublicId = useOnboardingDraftStore((s) => s.salonPublicId);
  const saving = panel.createBranch.isPending || panel.patchBranch.isPending || panel.removeBranch.isPending;

  const [draft, setDraft] = useState<BranchEditorValues | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [coordsOpen, setCoordsOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [toast, setToast] = useState<DashboardToastState>(null);
  const impactQuery = useQueryBranchRemovalImpact(removeOpen ? draft?.publicId ?? null : null);
  const impact = impactQuery.data?.data;
  const blockers = impact ? removalBlockers(impact) : [];

  const isNew = !!draft && !draft.publicId;
  const errors = draft && submitted
    ? {
        name: draft.name.trim() ? undefined : "نام شعبه الزامی است.",
        city: draft.city.trim() ? undefined : "شهر الزامی است.",
        address: draft.address.trim() ? undefined : "آدرس الزامی است.",
      }
    : {};

  /** An unfinished onboarding draft of this salon keeps its own copy of the branches. */
  const syncDraft = (next: BranchEditorValues[]) => {
    if (salonPublicId && draftSalonPublicId === salonPublicId) setDraftBranches(toApi(next));
  };

  // One branch per request: create / PATCH / guarded DELETE under api/salon/branches.
  const onSave = async () => {
    if (!draft) return;
    setSubmitted(true);
    if (!draft.name.trim() || !draft.city.trim() || !draft.address.trim()) return;
    try {
      if (isNew) {
        const res = await panel.createBranch.mutateAsync(toBranchRequest(draft));
        syncDraft([...branches, { ...draft, publicId: res.data?.publicId ?? draft.publicId }]);
      } else {
        await panel.patchBranch.mutateAsync({ publicId: draft.publicId!, body: toBranchRequest(draft) });
        syncDraft(branches.map((b) => (b.publicId === draft.publicId ? draft : b)));
      }
      setToast({ type: "success", message: isNew ? "شعبه اضافه شد." : "شعبه ذخیره شد." });
      setDraft(null);
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "ذخیره‌ی شعبه ناموفق بود.") });
    }
  };

  const onRemove = async () => {
    if (!draft?.publicId) return;
    try {
      await panel.removeBranch.mutateAsync(draft.publicId);
      syncDraft(branches.filter((b) => b.publicId !== draft.publicId));
      setToast({ type: "success", message: "شعبه حذف شد." });
      setDraft(null);
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "حذف شعبه ناموفق بود.") });
    }
    setRemoveOpen(false);
  };

  const open = (b: BranchEditorValues) => {
    setDraft(b);
    setSubmitted(false);
    setCoordsOpen(b.latitude != null || b.longitude != null);
  };

  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader
        title="شعبه‌ها"
        backHref={RouteAddress.DASHBOARD.SALON}
        action={
          <Button size="sm" className="gap-1 rounded-[12px]" onClick={() => open(createEmptyBranch())}>
            <PlusIcon size={14} weight="bold" />
            شعبه
          </Button>
        }
      />

      {!salon ? (
        <SalonInfoSkeleton />
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {branches.map((b) => (
            <button
              key={b.clientKey}
              type="button"
              onClick={() => open(b)}
              className="flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-surface-hover"
            >
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[15px] font-bold", b.isActive ? "text-foreground" : "text-foreground-muted")}>
                  {b.name || "بدون نام"}
                </span>
                <span className="block truncate text-xs text-foreground-muted">
                  {[b.city, b.address].filter(Boolean).join(" · ")}
                  {b.isActive ? "" : " · غیرفعال"}
                </span>
              </span>
              <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
            </button>
          ))}
        </div>
      )}

      <BottomSheet open={!!draft} onClose={() => setDraft(null)}>
        {draft ? (
          <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pb-2">
            <h2 className="text-base font-bold text-foreground">{isNew ? "شعبه‌ی جدید" : draft.name}</h2>
            <Field label="نام شعبه" error={errors.name}>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="مثلاً ونک" className="rounded-[12px]" hasError={!!errors.name} />
            </Field>
            <Field label="شهر" error={errors.city}>
              <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="تهران" className="rounded-[12px]" hasError={!!errors.city} />
            </Field>
            <Field label="آدرس" error={errors.address}>
              <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="خیابان، پلاک…" className="rounded-[12px]" hasError={!!errors.address} />
            </Field>
            <Field label="تلفن شعبه (اختیاری)">
              <PhoneInput kind="landline" value={draft.phone} onValueChange={(phone) => setDraft({ ...draft, phone })} placeholder="021…" className="rounded-[12px]" />
            </Field>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-foreground-muted">مشتریان</p>
              <div className="flex gap-2">
                {GENDER_TYPE_OPTIONS.map((o) => (
                  <button key={o.value} type="button" className={chip(draft.genderType === o.value)} onClick={() => setDraft({ ...draft, genderType: o.value })}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-[16px] bg-background-secondary px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-foreground">فعال</span>
                <span className="block text-xs leading-5 text-foreground-muted">
                  غیرفعال یعنی نوبت جدید برای این شعبه ثبت نمی‌شود؛ نوبت‌های قبلی سر جایشان می‌مانند و به مشتری خبر داده نمی‌شود.
                </span>
              </span>
              <Switch checked={draft.isActive} onCheckedChange={(isActive) => setDraft({ ...draft, isActive })} />
            </label>
            <button type="button" onClick={() => setCoordsOpen((v) => !v)} className="flex items-center gap-1 self-start text-xs font-semibold text-foreground-muted">
              موقعیت روی نقشه (اختیاری)
              <CaretDownIcon size={12} className={cn("transition-transform", coordsOpen && "rotate-180")} />
            </button>
            {coordsOpen ? (
              <div className="grid grid-cols-2 gap-2">
                <Field label="عرض جغرافیایی">
                  <Input inputMode="decimal" dir="ltr" value={draft.latitude ?? ""} placeholder="35.7219" className="rounded-[12px]"
                    onChange={(e) => setDraft({ ...draft, latitude: e.target.value === "" ? null : Number(e.target.value) })} />
                </Field>
                <Field label="طول جغرافیایی">
                  <Input inputMode="decimal" dir="ltr" value={draft.longitude ?? ""} placeholder="51.3347" className="rounded-[12px]"
                    onChange={(e) => setDraft({ ...draft, longitude: e.target.value === "" ? null : Number(e.target.value) })} />
                </Field>
              </div>
            ) : null}
            <Button type="button" className="w-full rounded-[12px]" isLoading={saving} onClick={() => void onSave()}>
              {isNew ? "افزودن شعبه" : "ذخیره"}
            </Button>
            {!isNew && branches.length > 1 ? (
              <button type="button" onClick={() => setRemoveOpen(true)} className="text-sm font-semibold text-error">
                حذف این شعبه
              </button>
            ) : null}
          </div>
        ) : null}
      </BottomSheet>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف شعبه‌ی {draft?.name}؟</DialogTitle>
            <DialogDescription>
              {impactQuery.isLoading
                ? "در حال بررسی…"
                : blockers.length
                  ? "فعلاً نمی‌شود این شعبه را حذف کرد:"
                  : "اگر فقط موقتاً تعطیل است، به‌جای حذف آن را غیرفعال کنید."}
            </DialogDescription>
            {blockers.length ? (
              <ul className="mt-2 flex list-disc flex-col gap-1 pr-5 text-sm text-foreground">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : impact?.branchOnlyServicesCount ? (
              <p className="mt-2 text-sm text-warning">
                {impact.branchOnlyServicesCount.toLocaleString(APP_LOCALE)} خدمت فقط مخصوص این شعبه است و دیگر رزرو نمی‌شود.
              </p>
            ) : null}
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" className={dashboardQuietButtonClass} onClick={() => setRemoveOpen(false)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:bg-error-background"
              disabled={impactQuery.isLoading || (impact ? !impact.canRemove : false)}
              isLoading={panel.removeBranch.isPending}
              onClick={() => void onRemove()}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
