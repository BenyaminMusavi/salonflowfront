"use client";

import Link from "next/link";
import { useState } from "react";
import { CaretLeftIcon, UserPlusIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import { PhoneInput } from "@/shared/components/primitives/input/PhoneInput";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import { APP_LOCALE } from "@/shared/utils/locale";
import { hhmm } from "../_schedule/scheduleUtils";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { STAFF_STATE_LABEL, useSalonStaff, type ISalonStaffMember } from "../_staff/useSalonStaff";

const PHONE_RULE = /^09\d{9}$/;

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** «امروز 10:00 تا 14:00، 16:00 تا 20:00 · 3 نوبت» / «امروز تعطیل». */
function todayLine(member: ISalonStaffMember): string | null {
  const t = member.today;
  if (!t || (member.state !== "active" && member.state !== "owner")) return null;
  if (t.isOff || t.ranges.length === 0) return "امروز تعطیل";
  const hours = t.ranges.map((r) => `${hhmm(r.start)} تا ${hhmm(r.end)}`).join("، ");
  return [`امروز ${hours}`, t.appointmentsCount ? `${t.appointmentsCount.toLocaleString(APP_LOCALE)} نوبت` : null]
    .filter(Boolean)
    .join(" · ");
}

function StaffRow({ member, showBranch }: { member: ISalonStaffMember; showBranch: boolean }) {
  const meta = [
    member.state === "active" ? null : STAFF_STATE_LABEL[member.state],
    todayLine(member),
    showBranch ? member.branchName : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={RouteAddress.DASHBOARD.STAFF_DETAILS(member.publicId)}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          member.state === "active" || member.state === "owner"
            ? "bg-surface-brand text-content-brand"
            : "bg-surface-hover text-foreground-muted"
        )}
      >
        {/^\d/.test(member.name) ? "؟" : member.name.charAt(0)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-foreground" dir="auto">
          {member.name}
        </span>
        <span
          className={cn(
            "block truncate text-xs",
            member.state === "rejected" ? "text-error" : "text-foreground-muted"
          )}
        >
          {meta}
        </span>
      </span>
      <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
    </Link>
  );
}

/** «پرسنل» — everyone in the salon; a row opens that person's page, «دعوت پرسنل» adds one. */
export default function StaffView() {
  const { members, branches, services, isLoading, isError, staff, isSaving } = useSalonStaff();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [branchPublicId, setBranchPublicId] = useState("");
  const [offeringIds, setOfferingIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const multiBranch = branches.length > 1;

  const openInvite = () => {
    setPhone("");
    setBranchPublicId(branches[0]?.publicId ?? "");
    setOfferingIds([]);
    setError("");
    setInviteOpen(true);
  };

  const invite = async () => {
    const value = phone.trim();
    if (!PHONE_RULE.test(value)) return setError("شماره موبایل معتبر نیست (مثال: 09123456789)");
    if (members.some((m) => m.phone === value)) return setError("این شماره قبلاً در پرسنل هست.");
    if (!branchPublicId) return setError("شعبه را انتخاب کنید.");
    if (offeringIds.length === 0) return setError("حداقل یک خدمت انتخاب کنید.");
    setError("");
    try {
      await staff.invite.mutateAsync({ phone: value, branchPublicId, offeringPublicIds: offeringIds });
      setInviteOpen(false);
      setToast({ type: "success", message: "دعوت فرستاده شد. بعد از پذیرش، در فهرست فعال می‌شود." });
    } catch (err) {
      setError(getApiErrorMessage(err, "ارسال دعوت ناموفق بود."));
    }
  };

  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader
        title="پرسنل"
        backHref={RouteAddress.DASHBOARD.SALON}
        action={
          <Button size="sm" className="gap-1 rounded-[12px]" onClick={openInvite}>
            <UserPlusIcon size={16} />
            دعوت پرسنل
          </Button>
        }
      />

      {isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : isError ? (
        <p className="text-sm text-error">دریافت پرسنل ناموفق بود.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {members.map((m) => (
            <StaffRow key={m.publicId} member={m} showBranch={multiBranch} />
          ))}
        </div>
      )}

      <BottomSheet open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">دعوت پرسنل</h2>
            <p className="mt-1 text-xs leading-5 text-foreground-muted">
              با همین شماره وارد صفا می‌شود و دعوت را می‌پذیرد.
            </p>
          </div>
          <PhoneInput placeholder="09xxxxxxxxx" value={phone} onValueChange={setPhone} />
          {multiBranch ? (
            <section className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground-muted">شعبه</p>
              <div className="flex flex-wrap gap-2">
                {branches.map((b) => (
                  <button key={b.publicId} type="button" className={chip(branchPublicId === b.publicId)} onClick={() => setBranchPublicId(b.publicId)}>
                    {b.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground-muted">چه خدماتی انجام می‌دهد؟</p>
            {services.length === 0 ? (
              <p className="text-xs text-foreground-muted">ابتدا در «سالن ← خدمات» خدمت تعریف کنید.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {services.map((s) =>
                  s.offeringPublicId ? (
                    <button
                      key={s.offeringPublicId}
                      type="button"
                      className={chip(offeringIds.includes(s.offeringPublicId))}
                      onClick={() =>
                        setOfferingIds((ids) =>
                          ids.includes(s.offeringPublicId!)
                            ? ids.filter((x) => x !== s.offeringPublicId)
                            : [...ids, s.offeringPublicId!]
                        )
                      }
                    >
                      {s.name}
                    </button>
                  ) : null
                )}
              </div>
            )}
            <p className="text-[11px] text-foreground-muted">قیمت و مدت متفاوت برای این نفر را بعداً از صفحه‌ی خودش تنظیم کنید.</p>
          </section>
          {error ? <p className="text-xs text-error">{error}</p> : null}
          <Button type="button" className="w-full rounded-[12px]" isLoading={isSaving} onClick={() => void invite()}>
            ارسال دعوت
          </Button>
        </div>
      </BottomSheet>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
