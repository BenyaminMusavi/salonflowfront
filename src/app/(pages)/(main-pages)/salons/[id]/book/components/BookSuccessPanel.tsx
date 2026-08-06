"use client";

import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { RouteAddress } from "@/shared/data/routeAddress";

interface BookSuccessPanelProps {
  bookingId: number;
  salonId: string;
}

export default function BookSuccessPanel({
  bookingId,
  salonId,
}: BookSuccessPanelProps) {
  return (
    <div className="flex flex-col gap-6 px-safe-area pb-24 pt-4">
      <TopNavigation>رزرو موفق</TopNavigation>
      <div className="rounded-[24px] bg-surface px-6 py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircleIcon size={36} weight="fill" />
        </div>
        <p className="mt-5 text-lg font-bold text-foreground">
          نوبت شما با موفقیت ثبت شد
        </p>
        <p className="mt-2 text-sm text-foreground-muted">
          شماره نوبت: {bookingId.toLocaleString("fa-IR")}
        </p>
        <Link
          href={RouteAddress.RESERVATION.DETAILS(bookingId)}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground"
        >
          مشاهده نوبت
        </Link>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href={RouteAddress.RESERVATION.BASE}
            className="text-sm text-foreground-muted"
          >
            همه نوبت‌ها
          </Link>
          <Link
            href={RouteAddress.SALONS.DETAILS(salonId)}
            className="text-sm text-primary"
          >
            بازگشت به سالن
          </Link>
        </div>
      </div>
    </div>
  );
}
