"use client";

import { useSearchParams } from "next/navigation";

export default function OtpPhoneSubtitle() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "شماره موبایل";

  return (
    <span className="text-foreground/60 text-[14px]">
      کد تایید به شماره {phone} ارسال شد.
    </span>
  );
}
