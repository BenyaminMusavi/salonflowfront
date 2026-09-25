"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { shareOrCopyLink, useSalonShareLink } from "@/shared/utils/salonShareLink";

interface SalonLinkCardProps {
  /** Current username from the API response — never a locally edited/unsaved value. */
  username: string | null | undefined;
  salonName: string;
  /** Before approval the public link 404s for everyone except the salon's own members. */
  isApproved: boolean;
}

// QR stays dark-on-light in both themes: many scanners can't read an inverted code.
const QR_FG = "#000000";
const QR_BG = "#ffffff";

/** Owner-facing "your salon's public link" card: copy, share, and a downloadable QR code. */
export default function SalonLinkCard({ username, salonName, isApproved }: SalonLinkCardProps) {
  const { url, display } = useSalonShareLink(username);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<"" | "copied" | "error">("");

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(""), 2000);
    return () => clearTimeout(timer);
  }, [feedback]);

  if (!username || !url) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("copied");
    } catch {
      setFeedback("error");
    }
  };

  const onShare = async () => {
    try {
      const outcome = await shareOrCopyLink({
        url,
        title: salonName,
        text: `${salonName} را در صفا ببینید و آنلاین نوبت بگیرید:`,
      });
      if (outcome === "copied") setFeedback("copied");
    } catch {
      setFeedback("error");
    }
  };

  const onDownloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `saffa-${username}-qr.png`;
    a.click();
  };

  return (
    <section className="rounded-[20px] border border-border bg-surface p-4">
      <h2 className="text-sm font-bold text-foreground">لینک اختصاصی سالن</h2>
      <p className="mt-1 text-xs text-foreground-muted">
        این لینک را در اینستاگرام، پیامک یا کارت ویزیت بگذارید تا مشتری مستقیم به صفحه‌ی سالن شما برسد.
      </p>
      {!isApproved && (
        <p className="mt-2 rounded-xl bg-warning-background px-3 py-2 text-xs text-warning">
          این لینک پس از تأیید سالن برای همه قابل مشاهده می‌شود.
        </p>
      )}

      <p
        dir="ltr"
        className="mt-3 break-all rounded-xl bg-input px-3 py-2 text-left text-sm font-medium text-foreground"
      >
        {display}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center justify-center gap-1.5 rounded-full bg-input py-2.5 text-xs font-semibold text-foreground"
        >
          {feedback === "copied" ? <CheckIcon size={16} weight="bold" /> : <CopyIcon size={16} />}
          {feedback === "copied" ? "کپی شد" : "کپی لینک"}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <ShareNetworkIcon size={16} />
          اشتراک‌گذاری
        </button>
      </div>
      {feedback === "error" && (
        <p className="mt-2 text-xs text-error">کپی یا اشتراک‌گذاری لینک ناموفق بود.</p>
      )}

      <div className="mt-4 flex flex-col items-center gap-2 border-t border-border pt-4">
        <QRCodeCanvas
          ref={qrRef}
          value={url}
          size={512}
          marginSize={2}
          level="M"
          fgColor={QR_FG}
          bgColor={QR_BG}
          style={{ width: 160, height: 160 }}
          className="rounded-xl"
          aria-label={`QR لینک ${salonName}`}
        />
        <button
          type="button"
          onClick={onDownloadQr}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          <DownloadSimpleIcon size={16} />
          دانلود QR برای چاپ
        </button>
      </div>
    </section>
  );
}
