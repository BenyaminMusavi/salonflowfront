"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <WarningCircleIcon size={48} weight="bold" className="text-error" />
      <h1 className="text-lg font-bold text-foreground">خطایی رخ داده است</h1>
      <p className="text-sm text-foreground-muted">
        مشکلی در نمایش این صفحه پیش آمد. لطفاً دوباره تلاش کنید.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          تلاش دوباره
        </button>
        <Link
          href={RouteAddress.HOME.BASE}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}
