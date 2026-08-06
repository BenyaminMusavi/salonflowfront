"use client";

import Image from "next/image";
import { LightningIcon, UserIcon } from "@phosphor-icons/react";
import { IStaffAvailability } from "@/services/domains/salons/types/booking-browse.type";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";

interface BookStaffStepProps {
  staffList: IStaffAvailability[];
  selectedStaffPublicId: string | null;
  useFirstAvailable: boolean;
  isLoading?: boolean;
  onSelectFirstAvailable: () => void;
  onSelectStaff: (staff: IStaffAvailability) => void;
  onChangeDate?: () => void;
}

function StaffAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
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

export default function BookStaffStep({
  staffList,
  selectedStaffPublicId,
  useFirstAvailable,
  isLoading = false,
  onSelectFirstAvailable,
  onSelectStaff,
  onChangeDate,
}: BookStaffStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">انتخاب پرسنل</h2>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      ) : null}

      {!isLoading ? (
        <ul className="flex flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={onSelectFirstAvailable}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition",
                useFirstAvailable
                  ? "bg-primary/10 ring-1 ring-primary"
                  : "bg-surface hover:bg-surface-hover"
              )}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <LightningIcon size={22} weight="fill" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">
                  اولین زمان آزاد
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  سیستم مناسب‌ترین پرسنل را انتخاب می‌کند
                </p>
              </div>
            </button>
          </li>

          {staffList.map((s) => {
            const selected =
              !useFirstAvailable &&
              selectedStaffPublicId === s.staffPublicId;
            const hours =
              [s.startTime, s.endTime].filter(Boolean).join(" – ") || null;

            return (
              <li key={s.staffPublicId}>
                <button
                  type="button"
                  onClick={() => onSelectStaff(s)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition",
                    selected
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-surface hover:bg-surface-hover"
                  )}
                >
                  <StaffAvatar name={s.fullName} imageUrl={s.profileImageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {s.fullName}
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {hours ?? "ساعات کاری اعلام نشده"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!isLoading && staffList.length === 0 ? (
        <p className="text-xs text-foreground-muted">
          پرسنل مشخصی برای این تاریخ لیست نشده؛ می‌توانید «اولین زمان آزاد» را
          انتخاب کنید
          {onChangeDate ? (
            <>
              {" "}
              یا{" "}
              <button
                type="button"
                onClick={onChangeDate}
                className="font-medium text-primary"
              >
                تاریخ را تغییر دهید
              </button>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </section>
  );
}
