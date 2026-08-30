"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import "@/shared/styles/globals.css";

// Replaces the root layout entirely when the layout itself throws, so per Next's
// error-boundary contract this must define its own <html>/<body> and import
// global styles directly rather than relying on (pages)/layout.tsx.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <WarningCircleIcon size={48} weight="bold" className="text-error" />
          <h1 className="text-lg font-bold text-foreground">خطایی رخ داده است</h1>
          <p className="text-sm text-foreground-muted">
            مشکلی پیش‌بینی‌نشده در برنامه رخ داد. لطفاً دوباره تلاش کنید.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              تلاش دوباره
            </button>
            <a
              href="/"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              بازگشت به خانه
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
