"use client";

import Image from "next/image";
import { CircleNotchIcon, LightningIcon, UserIcon } from "@phosphor-icons/react";
import {
  IFirstAvailableSlot,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import { APP_LOCALE } from "@/shared/utils/locale";

export interface FirstAvailableState {
  isLoading: boolean;
  /** undefined = not asked yet, null = no free slot in the booking window. */
  result: IFirstAvailableSlot | null | undefined;
  /** Lookup failed (e.g. endpoint unavailable) — the date step falls back to all staff's times. */
  isError: boolean;
}

interface BookStaffStepProps {
  /** Staff who perform the selected services. */
  staffList: IStaffAvailability[];
  selectedStaffPublicId: string | null;
  useFirstAvailable: boolean;
  firstAvailable: FirstAvailableState;
  isLoading?: boolean;
  onSelectFirstAvailable: () => void;
  onSelectStaff: (staff: IStaffAvailability) => void;
  onChangeServices?: () => void;
}

function StaffAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const src = salonImageSrc(imageUrl, "");
  const monogram = (name.trim().charAt(0) || "پ").toUpperCase();

  if (src) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-hover">
        <Image
          src={src}
          alt={name}
          fill
          unoptimized={/^https?:\/\//i.test(src)}
          className="object-cover"
          sizes="44px"
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-hover text-sm font-bold text-foreground-muted">
      {monogram || <UserIcon size={18} />}
    </div>
  );
}

function formatFirstAvailable(slot: IFirstAvailableSlot): string {
  let day = slot.date;
  try {
    day = new Date(`${slot.date}T12:00:00`).toLocaleDateString(APP_LOCALE, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    // keep yyyy-MM-dd
  }
  const time = slot.time.slice(0, 5);
  return slot.staffName ? `${day}، ساعت ${time} · با ${slot.staffName}` : `${day}، ساعت ${time}`;
}

function firstAvailableSubtitle(selected: boolean, state: FirstAvailableState) {
  if (!selected) return "زودترین زمان آزاد بین پرسنلی که این خدمت را انجام می‌دهند";
  if (state.isLoading) {
    return (
      <span className="flex items-center gap-1">
        <CircleNotchIcon size={14} className="animate-spin" /> در حال پیدا کردن اولین نوبت…
      </span>
    );
  }
  if (state.result) return formatFirstAvailable(state.result);
  if (state.result === null) return "نوبت آزادی پیدا نشد؛ یکی از پرسنل زیر را انتخاب کنید.";
  return "در مرحله‌ی بعد، ساعت‌های آزاد همه‌ی پرسنل نمایش داده می‌شود.";
}

export default function BookStaffStep({
  staffList,
  selectedStaffPublicId,
  useFirstAvailable,
  firstAvailable,
  isLoading = false,
  onSelectFirstAvailable,
  onSelectStaff,
  onChangeServices,
}: BookStaffStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">انتخاب پرسنل</h2>

      <button
        type="button"
        onClick={onSelectFirstAvailable}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition",
          useFirstAvailable ? "bg-primary/10 ring-1 ring-primary" : "bg-surface hover:bg-surface-hover"
        )}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <LightningIcon size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">اولین نوبت</p>
          <p
            className={cn(
              "mt-1 text-xs",
              useFirstAvailable && firstAvailable.result ? "font-medium text-primary" : "text-foreground-muted"
            )}
          >
            {firstAvailableSubtitle(useFirstAvailable, firstAvailable)}
          </p>
        </div>
      </button>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {staffList.map((s) => {
            const selected = !useFirstAvailable && selectedStaffPublicId === s.staffPublicId;
            return (
              <li key={s.staffPublicId}>
                <button
                  type="button"
                  onClick={() => onSelectStaff(s)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition",
                    selected ? "bg-primary/10 ring-1 ring-primary" : "bg-surface hover:bg-surface-hover"
                  )}
                >
                  <StaffAvatar name={s.fullName} imageUrl={s.profileImageUrl} />
                  <p className="min-w-0 flex-1 text-sm font-bold text-foreground">{s.fullName}</p>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && staffList.length === 0 ? (
        <p className="text-xs text-foreground-muted">
          پرسنلی برای این خدمات پیدا نشد؛ «اولین نوبت» را انتخاب کنید
          {onChangeServices ? (
            <>
              {" "}
              یا{" "}
              <button type="button" onClick={onChangeServices} className="font-medium text-primary">
                خدمات را تغییر دهید
              </button>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </section>
  );
}
