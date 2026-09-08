"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserIcon } from "@phosphor-icons/react/ssr";
import { CameraIcon } from "@phosphor-icons/react";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateUploadAvatar } from "@/services/domains/auth/hooks/useMutateUploadAvatar";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { salonImageSrc } from "@/shared/utils/salonDisplay";

export default function ProfileAvatar() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data, isLoading } = useQueryAuthMe();
  const me = data?.data;
  const { mutate: uploadAvatar, isPending: isUploading } =
    useMutateUploadAvatar();
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName =
    `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "کاربر";
  const initial = fullName.charAt(0);
  const avatarSrc = me?.avatarUrl ? salonImageSrc(me.avatarUrl, "") : "";

  const handlePickFile = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !me?.publicId) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("فقط فایل تصویری مجاز است.");
      return;
    }

    setUploadError("");
    uploadAvatar(
      { file, customerPublicId: me.publicId },
      {
        onError: () => setUploadError("آپلود عکس ناموفق بود."),
      }
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 px-safe-area">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-tertiary">
          <UserIcon size={32} className="text-foreground-muted" />
        </div>
        <p className="text-sm text-foreground-muted">وارد حساب نشده‌اید</p>
        <Link
          href={RouteAddress.AUTH.LOGIN.BASE}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
        >
          ورود / ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-border-strong to-background-elevated">
          {isLoading ? (
            <UserIcon size={32} />
          ) : avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={fullName}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="text-[28px] font-bold text-foreground">
              {initial}
            </span>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-overlay/50">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePickFile}
          disabled={isUploading}
          aria-label="تغییر عکس پروفایل"
          className="absolute bottom-0 end-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background disabled:opacity-60"
        >
          <CameraIcon size={14} weight="bold" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-[12px] text-error">{uploadError}</p>
      )}

      <h2 className="mt-2 text-[20px] font-bold text-foreground">
        {isLoading ? "…" : fullName}
      </h2>
      <p className="text-[13px] text-foreground-muted" dir="ltr">
        {me?.phone ?? "—"}
      </p>
    </div>
  );
}
