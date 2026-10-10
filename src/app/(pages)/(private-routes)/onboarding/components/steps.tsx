"use client";

import { useState } from "react";
import { CaretDownIcon, CaretLeftIcon, PlusIcon, UserIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import SalonUsernameField from "@/shared/components/composites/salon-username/SalonUsernameField";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { PhoneInput } from "@/shared/components/primitives/input/PhoneInput";
import { DurationPicker } from "@/shared/components/primitives/input/DurationPicker";
import { GenderType } from "@/services/common/enums/domain-enums";
import {
  GENDER_TYPE_OPTIONS,
  useOnboardingDraftStore,
} from "@/services/domains/salons/store/useOnboardingDraftStore";
import type {
  IOnboardingBranch,
  IOnboardingService,
  IOnboardingStaff,
} from "@/services/domains/salons/types/onboarding.type";
import type { IServiceType } from "@/services/domains/service-type/types/service-type.type";
import { getServiceTypeIcon } from "@/shared/data/serviceTypeIcons";
import { APP_LOCALE } from "@/shared/utils/locale";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import { isValidServiceDuration } from "@/shared/utils/serviceDuration";
import { SalonPhotosEditor } from "../../dashboard/salon/photos/SalonPhotosEditor";
import { OnboardingWeekEditor, scheduleSummary } from "./OnboardingWeekEditor";
import { Field, RemoveButton, StepTitle, cardClass, chipClass } from "./ui";

const textareaClass =
  "w-full rounded-[12px] border border-input-border bg-input px-4 py-3 text-sm text-foreground outline-none placeholder:text-input-placeholder";

export const VALID_GENDERS = [GenderType.Male, GenderType.Female, GenderType.Mixed] as number[];

export function isBranchComplete(b: IOnboardingBranch) {
  return !!b.name.trim() && !!b.city.trim() && !!b.address.trim() && VALID_GENDERS.includes(Number(b.genderType));
}

export const serviceTypeName = (types: IServiceType[], id: string) =>
  types.find((t) => String(t.id) === String(id))?.name ?? "خدمت";

/* ---------------- 1 · سالن ---------------- */

export function StepSalon({
  usernameError,
  onUsernameErrorClear,
  showErrors,
}: {
  usernameError: string;
  onUsernameErrorClear: () => void;
  showErrors: boolean;
}) {
  const draft = useOnboardingDraftStore();
  const info = draft.basicInfo;
  const hasContact = !!(info.instagramHandle || info.whatsappNumber || info.websiteUrl);
  const [contactOpen, setContactOpen] = useState(hasContact);

  return (
    <section className="flex flex-col gap-5">
      <StepTitle title="سالن شما" description="نام و آدرس اختصاصی سالن؛ بقیه را بعداً هم می‌توانید کامل کنید." />
      <Field label="نام سالن" error={showErrors && !info.name.trim() ? "نام سالن را بنویسید." : null}>
        <Input
          value={info.name}
          onChange={(e) => draft.setBasicInfo({ name: e.target.value })}
          placeholder="مثلاً سالن زیبایی رز"
          className="rounded-[12px]"
          hasError={showErrors && !info.name.trim()}
        />
      </Field>
      <SalonUsernameField
        value={info.username ?? ""}
        onChange={(username) => {
          onUsernameErrorClear();
          draft.setBasicInfo({ username });
        }}
        salonPublicId={draft.salonPublicId}
        error={usernameError || undefined}
      />
      <Field label="درباره‌ی سالن (اختیاری)" hint="چند جمله درباره‌ی تخصص و فضای سالن؛ در صفحه‌ی سالن نشان داده می‌شود.">
        <textarea
          rows={3}
          value={info.description ?? ""}
          onChange={(e) => draft.setBasicInfo({ description: e.target.value })}
          className={textareaClass}
        />
      </Field>

      <div className="flex flex-col gap-4 rounded-[20px] bg-surface p-4">
        <button
          type="button"
          onClick={() => setContactOpen((v) => !v)}
          aria-expanded={contactOpen}
          className="flex items-center justify-between text-right"
        >
          <span>
            <span className="block text-sm font-semibold text-foreground">راه‌های ارتباطی (اختیاری)</span>
            <span className="block text-xs text-foreground-muted">اینستاگرام، واتساپ و وب‌سایت</span>
          </span>
          <CaretDownIcon size={16} className={cn("text-foreground-muted transition-transform", contactOpen && "rotate-180")} />
        </button>
        {contactOpen ? (
          <>
            <Field label="اینستاگرام">
              <Input
                dir="ltr"
                value={info.instagramHandle ?? ""}
                onChange={(e) => draft.setBasicInfo({ instagramHandle: e.target.value })}
                placeholder="rose.salon"
                className="rounded-[12px]"
              />
            </Field>
            <Field label="واتساپ">
              <PhoneInput
                placeholder="09xxxxxxxxx"
                value={info.whatsappNumber ?? ""}
                onValueChange={(whatsappNumber) => draft.setBasicInfo({ whatsappNumber })}
                inputWrapperClassname="rounded-[12px]"
              />
            </Field>
            <Field label="وب‌سایت">
              <Input
                dir="ltr"
                value={info.websiteUrl ?? ""}
                onChange={(e) => draft.setBasicInfo({ websiteUrl: e.target.value })}
                placeholder="https://"
                className="rounded-[12px]"
              />
            </Field>
          </>
        ) : null}
      </div>
    </section>
  );
}

/* ---------------- 2 · شعبه ---------------- */

export const newBranch = (): IOnboardingBranch => ({
  publicId: null,
  name: "",
  city: "",
  address: "",
  latitude: null,
  longitude: null,
  // Unset on purpose: the owner chooses who the branch serves.
  genderType: 0 as GenderType,
  phone: "",
  isActive: true,
});

export function StepBranches({ showErrors }: { showErrors: boolean }) {
  const draft = useOnboardingDraftStore();
  const branches = draft.branches;
  const update = (idx: number, patch: Partial<IOnboardingBranch>) =>
    draft.setBranches(branches.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  return (
    <section className="flex flex-col gap-5">
      <StepTitle
        title={branches.length > 1 ? "شعبه‌ها" : "شعبه"}
        description="آدرسی که مشتری‌ها به آن می‌آیند. اگر چند شعبه دارید، همه را اضافه کنید."
      />
      {branches.map((b, idx) => (
        <div key={b.publicId ?? `new-${idx}`} className={cardClass}>
          {branches.length > 1 ? <p className="text-sm font-bold text-foreground">شعبه‌ی {(idx + 1).toLocaleString(APP_LOCALE)}</p> : null}
          <Field label="نام شعبه" error={showErrors && !b.name.trim() ? "نام شعبه را بنویسید." : null}>
            <Input value={b.name} onChange={(e) => update(idx, { name: e.target.value })} placeholder="مثلاً ونک" className="rounded-[12px]" hasError={showErrors && !b.name.trim()} />
          </Field>
          <Field label="شهر" error={showErrors && !b.city.trim() ? "شهر را بنویسید." : null}>
            <Input value={b.city} onChange={(e) => update(idx, { city: e.target.value })} placeholder="تهران" className="rounded-[12px]" hasError={showErrors && !b.city.trim()} />
          </Field>
          <Field label="آدرس" error={showErrors && !b.address.trim() ? "آدرس را بنویسید." : null}>
            <Input value={b.address} onChange={(e) => update(idx, { address: e.target.value })} placeholder="خیابان، کوچه، پلاک" className="rounded-[12px]" hasError={showErrors && !b.address.trim()} />
          </Field>
          <Field label="تلفن شعبه (اختیاری)">
            <PhoneInput kind="landline" placeholder="021…" value={b.phone ?? ""} onValueChange={(phone) => update(idx, { phone })} inputWrapperClassname="rounded-[12px]" />
          </Field>
          <Field label="مشتری‌های این شعبه" error={showErrors && !VALID_GENDERS.includes(Number(b.genderType)) ? "یکی را انتخاب کنید." : null}>
            <div className="flex flex-wrap gap-2">
              {GENDER_TYPE_OPTIONS.map((o) => (
                <button key={o.value} type="button" className={chipClass(Number(b.genderType) === o.value)} onClick={() => update(idx, { genderType: o.value })}>
                  {o.value === GenderType.Mixed ? "بانوان و آقایان" : o.label}
                </button>
              ))}
            </div>
          </Field>
          {branches.length > 1 ? (
            <RemoveButton
              label="حذف این شعبه"
              title={`حذف ${b.name || "این شعبه"}؟`}
              description="پرسنلی که در این شعبه گذاشته‌اید باید شعبه‌ی دیگری بگیرند."
              onConfirm={() => draft.setBranches(branches.filter((_, i) => i !== idx))}
            />
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => draft.setBranches([...branches, newBranch()])}
        className="flex items-center justify-center gap-2 rounded-[16px] border border-dashed border-border py-3 text-sm font-semibold text-primary"
      >
        <PlusIcon size={16} weight="bold" />
        شعبه‌ی دیگر
      </button>
    </section>
  );
}

/* ---------------- 3 · خدمات ---------------- */

type ServiceDraft = { idx: number | null; typeId: string; price: number | null; duration: number | null };

export function StepServices({ serviceTypes }: { serviceTypes: IServiceType[] }) {
  const draft = useOnboardingDraftStore();
  const services = draft.services;
  const [edit, setEdit] = useState<ServiceDraft | null>(null);
  const [tried, setTried] = useState(false);

  const usedTypes = new Set(services.map((s, i) => (edit?.idx === i ? "" : String(s.serviceTypePublicId))));
  const errors = edit
    ? {
        type: !edit.typeId ? "نوع خدمت را انتخاب کنید." : null,
        price: !edit.price || edit.price <= 0 ? "قیمت را بنویسید (بیشتر از صفر)." : null,
        duration: !isValidServiceDuration(edit.duration) ? "مدت باید بین 15 دقیقه تا 12 ساعت و مضرب 15 باشد." : null,
      }
    : null;

  const open = (idx: number | null) => {
    setTried(false);
    const s = idx != null ? services[idx] : null;
    setEdit({ idx, typeId: s ? String(s.serviceTypePublicId) : "", price: s?.basePrice || null, duration: s?.durationMinutes ?? 45 });
  };

  const save = () => {
    setTried(true);
    if (!edit || !errors || errors.type || errors.price || errors.duration) return;
    const row: IOnboardingService = {
      publicId: edit.idx != null ? services[edit.idx].publicId : null,
      serviceTypePublicId: edit.typeId,
      basePrice: edit.price!,
      durationMinutes: edit.duration!,
    };
    draft.setServices(edit.idx != null ? services.map((s, i) => (i === edit.idx ? row : s)) : [...services, row]);
    setEdit(null);
  };

  return (
    <section className="flex flex-col gap-5">
      <StepTitle title="خدمات" description="خدماتی که ارائه می‌دهید با قیمت و مدت. قیمت هر نفر را بعداً در پنل جدا می‌توانید تنظیم کنید." />
      {services.length ? (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-surface">
          {services.map((s, idx) => {
            const name = serviceTypeName(serviceTypes, s.serviceTypePublicId);
            const Icon = getServiceTypeIcon(name);
            return (
              <button key={s.publicId ?? `svc-${idx}`} type="button" onClick={() => open(idx)} className="flex items-center gap-3 px-4 py-3 text-right hover:bg-surface-hover">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-brand text-content-brand">
                  <Icon size={18} weight="duotone" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{name}</span>
                  <span className="block text-xs text-foreground-muted">
                    {s.durationMinutes.toLocaleString(APP_LOCALE)} دقیقه · {formatToman(s.basePrice)} تومان
                  </span>
                </span>
                <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[16px] bg-surface p-4 text-sm text-foreground-muted">هنوز خدمتی اضافه نکرده‌اید.</p>
      )}
      <button
        type="button"
        onClick={() => open(null)}
        className="flex items-center justify-center gap-2 rounded-[16px] border border-dashed border-border py-3 text-sm font-semibold text-primary"
      >
        <PlusIcon size={16} weight="bold" />
        افزودن خدمت
      </button>

      <BottomSheet open={!!edit} onClose={() => setEdit(null)}>
        {edit ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">{edit.idx != null ? "ویرایش خدمت" : "خدمت جدید"}</h3>
            <Field label="نوع خدمت" error={tried ? errors?.type : null}>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((t) => {
                  const id = String(t.id);
                  const taken = usedTypes.has(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={taken}
                      className={chipClass(edit.typeId === id, taken)}
                      onClick={() => setEdit({ ...edit, typeId: id })}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="قیمت" error={tried ? errors?.price : null}>
              <MoneyInput value={edit.price} onValueChange={(price) => setEdit({ ...edit, price })} placeholder="مثلاً 250,000" inputWrapperClassname="rounded-[12px]" />
            </Field>
            <Field label="مدت" error={tried ? errors?.duration : null}>
              <DurationPicker value={edit.duration} onChange={(duration) => setEdit({ ...edit, duration })} />
            </Field>
            <Button type="button" className="w-full rounded-[12px]" onClick={save}>
              {edit.idx != null ? "ذخیره" : "افزودن"}
            </Button>
            {edit.idx != null ? (
              <RemoveButton
                label="حذف این خدمت"
                title="حذف این خدمت؟"
                description="از خدمات پرسنل هم برداشته می‌شود."
                onConfirm={() => {
                  draft.setServices(services.filter((_, i) => i !== edit.idx));
                  setEdit(null);
                }}
              />
            ) : null}
          </div>
        ) : null}
      </BottomSheet>
    </section>
  );
}

/* ---------------- 4 · تیم و ساعت کاری ---------------- */

function ServiceChips({
  services,
  serviceTypes,
  selected,
  onToggle,
}: {
  services: IOnboardingService[];
  serviceTypes: IServiceType[];
  selected: string[];
  onToggle: (offeringPublicId: string) => void;
}) {
  const saved = services.filter((s) => s.publicId);
  if (!saved.length) return <p className="text-xs text-error">اول در مرحله‌ی «خدمات» خدمت اضافه و ذخیره کنید.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {saved.map((s) => {
        const id = String(s.publicId);
        return (
          <button key={id} type="button" className={chipClass(selected.includes(id))} onClick={() => onToggle(id)}>
            {serviceTypeName(serviceTypes, s.serviceTypePublicId)}
          </button>
        );
      })}
    </div>
  );
}

function BranchChips({ value, onChange }: { value: string; onChange: (publicId: string) => void }) {
  const branches = useOnboardingDraftStore((s) => s.branches).filter((b) => b.publicId);
  if (branches.length < 2) return null;
  return (
    <Field label="شعبه">
      <div className="flex flex-wrap gap-2">
        {branches.map((b) => (
          <button key={String(b.publicId)} type="button" className={chipClass(value === b.publicId)} onClick={() => onChange(String(b.publicId))}>
            {b.name || "شعبه"}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function StepTeam({ serviceTypes, showErrors }: { serviceTypes: IServiceType[]; showErrors: boolean }) {
  const draft = useOnboardingDraftStore();
  const staff = draft.staff;
  const ownerIdx = staff.findIndex((s) => s.isCreator);
  const owner = ownerIdx >= 0 ? staff[ownerIdx] : null;

  const update = (idx: number, patch: Partial<IOnboardingStaff>) =>
    draft.setStaff(staff.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const toggle = (idx: number, id: string) => {
    const cur = staff[idx].offeringPublicIds.map(String);
    update(idx, { offeringPublicIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const firstBranch = String(draft.branches.find((b) => b.publicId)?.publicId ?? "");
  const allOfferings = draft.services.filter((s) => s.publicId).map((s) => String(s.publicId));

  return (
    <section className="flex flex-col gap-5">
      <StepTitle title="تیم و ساعت کاری" description="چه کسی چه خدماتی انجام می‌دهد و شما چه ساعت‌هایی کار می‌کنید." />

      {owner ? (
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-brand text-content-brand">
              <UserIcon size={20} weight="duotone" />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground">شما (مالک)</span>
              <span className="block text-xs text-foreground-muted">مشتری‌ها می‌توانند پیش شما هم نوبت بگیرند.</span>
            </span>
          </div>
          <BranchChips value={owner.branchPublicId} onChange={(branchPublicId) => update(ownerIdx, { branchPublicId })} />
          <Field label="خدماتی که خودتان انجام می‌دهید" error={showErrors && owner.offeringPublicIds.length === 0 ? "حداقل یک خدمت را انتخاب کنید." : null}>
            <ServiceChips services={draft.services} serviceTypes={serviceTypes} selected={owner.offeringPublicIds.map(String)} onToggle={(id) => toggle(ownerIdx, id)} />
          </Field>
          <Field label="ساعت کاری شما">
            <OnboardingWeekEditor schedule={draft.schedule} onChange={draft.setSchedule} />
          </Field>
        </div>
      ) : null}

      {staff.map((s, idx) =>
        s.isCreator ? null : (
          <div key={s.publicId ?? `staff-${idx}`} className={cardClass}>
            <p className="text-sm font-bold text-foreground">همکار</p>
            <Field
              label="موبایل"
              hint="برایش پیامک دعوت فرستاده می‌شود؛ بعد از پذیرش در پنل فعال می‌شود."
              error={showErrors && !/^09\d{9}$/.test(s.phoneNumber ?? "") ? "شماره‌ی موبایل درست نیست (مثال: 09123456789)." : null}
            >
              <PhoneInput placeholder="09xxxxxxxxx" value={s.phoneNumber ?? ""} onValueChange={(phoneNumber) => update(idx, { phoneNumber })} inputWrapperClassname="rounded-[12px]" />
            </Field>
            <BranchChips value={s.branchPublicId} onChange={(branchPublicId) => update(idx, { branchPublicId })} />
            <Field label="خدمات" error={showErrors && s.offeringPublicIds.length === 0 ? "حداقل یک خدمت را انتخاب کنید." : null}>
              <ServiceChips services={draft.services} serviceTypes={serviceTypes} selected={s.offeringPublicIds.map(String)} onToggle={(id) => toggle(idx, id)} />
            </Field>
            <RemoveButton label="حذف همکار" title="حذف این همکار؟" onConfirm={() => draft.setStaff(staff.filter((_, i) => i !== idx))} />
          </div>
        )
      )}

      <button
        type="button"
        onClick={() =>
          draft.setStaff([
            ...staff,
            { publicId: null, branchPublicId: firstBranch, isCreator: false, phoneNumber: "", offeringPublicIds: allOfferings },
          ])
        }
        className="flex items-center justify-center gap-2 rounded-[16px] border border-dashed border-border py-3 text-sm font-semibold text-primary"
      >
        <PlusIcon size={16} weight="bold" />
        افزودن همکار
      </button>
      <p className="-mt-2 px-1 text-xs text-foreground-muted">همکار را بعداً هم از پنل سالن می‌توانید اضافه کنید.</p>
    </section>
  );
}

/* ---------------- 5 · عکس‌ها و ارسال ---------------- */

function SummaryBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground-muted">{title}</span>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-primary">
          ویرایش
        </button>
      </div>
      <div className="text-sm leading-6 text-foreground">{children}</div>
    </div>
  );
}

export function StepPhotosSubmit({ serviceTypes, onEdit }: { serviceTypes: IServiceType[]; onEdit: (step: number) => void }) {
  const draft = useOnboardingDraftStore();
  const colleagues = draft.staff.filter((s) => !s.isCreator);
  const genderLabel = (g: number) => (g === GenderType.Mixed ? "بانوان و آقایان" : GENDER_TYPE_OPTIONS.find((o) => o.value === g)?.label ?? "");

  return (
    <section className="flex flex-col gap-5">
      <StepTitle title="عکس‌ها و ارسال" description="عکس‌ها اختیاری‌اند ولی صفحه‌ی سالن را خیلی جذاب‌تر می‌کنند. بعد خلاصه را ببینید و ارسال کنید." />
      {draft.salonPublicId ? <SalonPhotosEditor salonPublicId={draft.salonPublicId} /> : null}

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-surface">
        <SummaryBlock title="سالن" onEdit={() => onEdit(1)}>
          <span className="font-bold">{draft.basicInfo.name || "—"}</span>
          {draft.basicInfo.username ? <span className="block text-xs text-foreground-muted" dir="ltr">/s/{draft.basicInfo.username}</span> : null}
        </SummaryBlock>
        <SummaryBlock title={draft.branches.length > 1 ? "شعبه‌ها" : "شعبه"} onEdit={() => onEdit(2)}>
          {draft.branches.map((b, i) => (
            <span key={b.publicId ?? i} className="block">
              {b.name} · {b.city}، {b.address} · {genderLabel(Number(b.genderType))}
            </span>
          ))}
        </SummaryBlock>
        <SummaryBlock title="خدمات" onEdit={() => onEdit(3)}>
          {draft.services.map((s, i) => (
            <span key={s.publicId ?? i} className="block">
              {serviceTypeName(serviceTypes, s.serviceTypePublicId)} · {s.durationMinutes.toLocaleString(APP_LOCALE)} دقیقه · {formatToman(s.basePrice)} تومان
            </span>
          ))}
        </SummaryBlock>
        <SummaryBlock title="تیم و ساعت کاری" onEdit={() => onEdit(4)}>
          <span className="block">
            شما{colleagues.length ? ` و ${colleagues.length.toLocaleString(APP_LOCALE)} همکار (${colleagues.map((c) => c.phoneNumber).join("، ")})` : ""}
          </span>
          {scheduleSummary(draft.schedule).map((line) => (
            <span key={line} className="block text-xs text-foreground-muted">
              {line}
            </span>
          ))}
        </SummaryBlock>
      </div>
      <p className="rounded-[16px] bg-surface-brand px-4 py-3 text-sm leading-6 text-foreground">
        با ارسال، سالن برای بررسی به تیم صفا می‌رود. بعد از تأیید به شما پیامک می‌دهیم، سالن در صفا دیده می‌شود و «پنل سالن» برایتان باز می‌شود.
      </p>
    </section>
  );
}
