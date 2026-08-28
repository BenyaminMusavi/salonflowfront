"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/primitives/button/Button";
import { useMutateSendOtp } from "@/services/domains/auth/hooks/useMutateSendOtp";

const RESEND_TIME = 120; // seconds

export default function OtpResendButton() {
  const [timeLeft, setTimeLeft] = React.useState(RESEND_TIME);
  const [error, setError] = React.useState("");
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const { mutateAsync, isPending } = useMutateSendOtp();

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleResend = async () => {
    if (!phone || isPending) return;
    setError("");
    try {
      // The gateway retries with backoff server-side (up to ~10s per attempt), so a
      // legitimate resend can take longer than 10s — stay disabled/spinning for the
      // whole request instead of assuming failure early (BACKEND_UPDATE_REPORT.md §2.3).
      await mutateAsync({ phone });
      setTimeLeft(RESEND_TIME);
    } catch {
      setError("ارسال مجدد کد ناموفق بود. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button
        type="button"
        className="w-full rounded-full bg-surface-tertiary py-3 text-[14px] text-foreground enabled:hover:bg-border disabled:opacity-50"
        disabled={timeLeft > 0}
        isLoading={isPending}
        onClick={handleResend}
      >
        {timeLeft > 0
          ? `${minutes}:${seconds.toString().padStart(2, "0")} تا ارسال مجدد کد`
          : "ارسال مجدد کد"}
      </Button>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
