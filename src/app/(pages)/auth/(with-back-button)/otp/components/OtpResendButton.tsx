"use client";
import React from "react";
import { Button } from "@/shared/components/primitives/button/Button";

const RESEND_TIME = 120; // seconds

export default function OtpResendButton() {
  const [timeLeft, setTimeLeft] = React.useState(RESEND_TIME);

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <button
      disabled={timeLeft > 0}
      className="w-full flex gap-x-2 items-center justify-center py-3 text-[14px] rounded-full transition-colors
        bg-surface-tertiary text-foreground disabled:opacity-50 disabled:cursor-not-allowed
        enabled:hover:bg-border"
      onClick={() => {
        // call resend OTP API here
        setTimeLeft(RESEND_TIME);
      }}
    >
      {timeLeft > 0
        ? `${minutes}:${seconds.toString().padStart(2, "0")} تا ارسال مجدد کد`
        : "ارسال مجدد کد"}
    </button>
  );
}
