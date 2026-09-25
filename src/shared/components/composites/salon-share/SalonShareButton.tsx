"use client";

import { useEffect, useState } from "react";
import { CheckIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { shareOrCopyLink, useSalonShareLink } from "@/shared/utils/salonShareLink";

interface SalonShareButtonProps {
  username: string | null | undefined;
  salonName: string;
  className?: string;
  size?: number;
}

/** Round icon button: native share sheet on mobile, copy-to-clipboard fallback elsewhere. */
export default function SalonShareButton({
  username,
  salonName,
  className,
  size = 18,
}: SalonShareButtonProps) {
  const { url } = useSalonShareLink(username);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  if (!url) return null;

  const onClick = async () => {
    try {
      const outcome = await shareOrCopyLink({
        url,
        title: salonName,
        text: `${salonName} را در صفا ببینید و آنلاین نوبت بگیرید:`,
      });
      if (outcome === "copied") setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  const label =
    status === "copied"
      ? "لینک سالن کپی شد"
      : status === "error"
        ? "اشتراک‌گذاری ناموفق بود"
        : "اشتراک‌گذاری سالن";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="flex h-full w-full items-center justify-center rounded-full text-foreground transition"
      >
        {status === "copied" ? (
          <CheckIcon size={size} className="text-primary" weight="bold" />
        ) : (
          <ShareNetworkIcon size={size} />
        )}
      </button>
      {status !== "idle" && (
        <span
          role="status"
          className={cn(
            "absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface px-2 py-1 text-[11px] font-medium shadow",
            status === "error" ? "text-error" : "text-foreground"
          )}
        >
          {status === "copied" ? "لینک کپی شد" : "ناموفق بود"}
        </span>
      )}
    </div>
  );
}
