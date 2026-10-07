"use client";

import React, { Suspense } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";
import { buildAuthHref } from "@/shared/utils/authRedirect";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  // One door for new and existing users: phone → SMS code.
  const loginHref = buildAuthHref(RouteAddress.AUTH.LOGIN.BASE, callback);

  return (
    <div
      className={
        "px-safe-area gap-y-8 flex flex-col w-full h-full justify-end py-6"
      }
    >
      <div className={"flex flex-col items-center gap-y-3"}>
        <span className={"text-[18px] font-semibold"}>Salon Flow</span>
        <span className={"text-[14px]"}>-</span>
      </div>
      <div className={"flex flex-col gap-y-8 pt-6"}>
        <div className={"flex flex-col gap-y-2"}>
          <Button asChild>
            <Link href={loginHref}>ورود یا ثبت‌نام</Link>
          </Button>
        </div>
        <div className={"flex justify-center"}>
          <span className={"font-medium text-[12px] opacity-60"}>نسخه 0.1</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthPageView() {
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  );
}
