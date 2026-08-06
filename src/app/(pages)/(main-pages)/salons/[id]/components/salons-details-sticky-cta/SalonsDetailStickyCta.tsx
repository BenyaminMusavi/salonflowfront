"use client";

import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";

interface SalonsDetailStickyCtaProps {
  salonId: string;
}

export default function SalonsDetailStickyCta({
  salonId,
}: SalonsDetailStickyCtaProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center bg-background/95 p-4 backdrop-blur">
      <Link
        href={RouteAddress.SALONS.BOOK(salonId)}
        className="block w-full max-w-[600px] rounded-[30px] bg-primary py-4 text-center text-base font-bold text-primary-foreground"
      >
        رزرو نوبت
      </Link>
    </div>
  );
}
