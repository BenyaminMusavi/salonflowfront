"use client";

import { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/shared/components/primitives/drawer/Drawer";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { Button } from "@/shared/components/primitives/button/Button";
import { TextArea } from "@/shared/components/primitives/textArea/TextArea";
import { useQueryAdminSalonDetail } from "@/services/domains/admin/hooks/useQueryAdminSalonDetail";
import {
  useMutateApproveSalon,
  useMutateRejectSalon,
  useMutateSuspendSalon,
  useMutateRestoreSalon,
} from "@/services/domains/admin/hooks/useMutateAdminSalonActions";
import {
  useMutateHideMedia,
  useMutateUnhideMedia,
} from "@/services/domains/admin/hooks/useMutateAdminMediaVisibility";
import {
  formatAdminDate,
  salonApprovalStatusLabel,
  salonApprovalStatusVariant,
  trustStatusLabel,
  trustStatusVariant,
} from "@/services/domains/admin/utils/admin-salon-display";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { SalonApprovalStatus, TrustStatus } from "@/services/common/enums/domain-enums";
import { IAdminSalonPhoto } from "@/services/domains/admin/types/admin.type";
import { cn } from "@/shared/utils/className";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-[13px]">
      <span className="text-foreground-muted">{label}</span>
      <span className="text-foreground font-medium" dir="auto">
        {value}
      </span>
    </div>
  );
}

type ActionMode = "idle" | "confirm-approve" | "reject" | "suspend" | "restore";

export function SalonDetailDrawer({
  publicId,
  onClose,
}: {
  publicId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQueryAdminSalonDetail(publicId);
  const salon = data?.data;

  const [mode, setMode] = useState<ActionMode>("idle");
  const [reasonInput, setReasonInput] = useState("");
  const [mediaTarget, setMediaTarget] = useState<IAdminSalonPhoto | null>(null);
  const [mediaReasonInput, setMediaReasonInput] = useState("");

  useEffect(() => {
    setMode("idle");
    setReasonInput("");
    setMediaTarget(null);
    setMediaReasonInput("");
  }, [publicId]);

  const { mutateAsync: approve, isPending: isApproving } = useMutateApproveSalon();
  const { mutateAsync: reject, isPending: isRejecting } = useMutateRejectSalon();
  const { mutateAsync: suspend, isPending: isSuspending } = useMutateSuspendSalon();
  const { mutateAsync: restore, isPending: isRestoring } = useMutateRestoreSalon();
  const { mutateAsync: hideMedia, isPending: isHidingMedia } = useMutateHideMedia();
  const { mutateAsync: unhideMedia, isPending: isUnhidingMedia } = useMutateUnhideMedia();
  const isMediaActionPending = isHidingMedia || isUnhidingMedia;

  const handleApprove = async () => {
    if (!publicId) return;
    try {
      await approve(publicId);
      onClose();
    } catch {
      /* error surfaces via network state; keep drawer open */
    }
  };

  const handleReject = async () => {
    if (!publicId || !reasonInput.trim()) return;
    try {
      await reject({ publicId, data: { reason: reasonInput.trim() } });
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  const handleSuspend = async () => {
    if (!publicId || !reasonInput.trim()) return;
    try {
      await suspend({ publicId, data: { reason: reasonInput.trim() } });
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  const handleRestore = async () => {
    if (!publicId || !reasonInput.trim()) return;
    try {
      await restore({ publicId, data: { reason: reasonInput.trim() } });
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  const handleMediaVisibility = async () => {
    if (!mediaTarget || !mediaReasonInput.trim()) return;
    try {
      if (mediaTarget.isHidden) {
        await unhideMedia({
          mediaId: mediaTarget.id,
          data: { reason: mediaReasonInput.trim() },
        });
      } else {
        await hideMedia({
          mediaId: mediaTarget.id,
          data: { reason: mediaReasonInput.trim() },
        });
      }
      setMediaTarget(null);
      setMediaReasonInput("");
    } catch {
      /* keep the inline panel open on failure */
    }
  };

  const isPending = isApproving || isRejecting || isSuspending || isRestoring;

  return (
    <Drawer
      open={!!publicId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent showHandle={false} className="w-full sm:max-w-md">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">
            {isLoading ? "در حال بارگذاری…" : salon?.name ?? "جزئیات سالن"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            جزئیات کامل سالن برای تصمیم تایید، رد، تعلیق یا بازگرداندن
          </DrawerDescription>
          {salon ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant={salonApprovalStatusVariant(salon.approvalStatus)}>
                {salonApprovalStatusLabel(salon.approvalStatus)}
              </Badge>
              <Badge variant={trustStatusVariant(salon.trustStatus)}>
                {trustStatusLabel(salon.trustStatus)}
              </Badge>
            </div>
          ) : null}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-background-secondary" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-background-secondary" />
              <div className="h-24 w-full animate-pulse rounded bg-background-secondary" />
            </div>
          ) : salon ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 text-[11px] font-bold text-foreground-muted">مالک</p>
                <InfoRow label="نام" value={salon.ownerName} />
                <InfoRow label="شماره تماس" value={salon.ownerPhone} />
              </div>

              <div>
                <p className="mb-1 text-[11px] font-bold text-foreground-muted">
                  اطلاعات سالن
                </p>
                <InfoRow label="کد ملی/اقتصادی" value={salon.nationalCode} />
                <InfoRow label="اینستاگرام" value={salon.instagramHandle} />
                <InfoRow label="واتس‌اپ" value={salon.whatsappNumber} />
                <InfoRow label="وب‌سایت" value={salon.websiteUrl} />
                <InfoRow label="تاریخ ثبت" value={formatAdminDate(salon.createdAt)} />
                {salon.approvalStatus === SalonApprovalStatus.Rejected &&
                salon.rejectionReason ? (
                  <InfoRow label="دلیل رد قبلی" value={salon.rejectionReason} />
                ) : null}
              </div>

              {salon.description ? (
                <div>
                  <p className="mb-1 text-[11px] font-bold text-foreground-muted">توضیحات</p>
                  <p className="text-[13px] leading-6 text-foreground">
                    {salon.description}
                  </p>
                </div>
              ) : null}

              {salon.branches.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-bold text-foreground-muted">
                    شعبه‌ها ({salon.branches.length.toLocaleString("fa-IR")})
                  </p>
                  <div className="flex flex-col gap-2">
                    {salon.branches.map((branch, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border p-2.5 text-[12px]"
                      >
                        <p className="font-bold text-foreground">{branch.name}</p>
                        <p className="mt-0.5 text-foreground-muted">
                          {branch.city} — {branch.address}
                        </p>
                        <p className="mt-0.5 text-foreground-muted" dir="ltr">
                          {branch.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {salon.photos.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-bold text-foreground-muted">
                    تصاویر ({salon.photos.length.toLocaleString("fa-IR")})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {salon.photos.map((photo) => {
                      const src = salonImageSrc(photo.thumbnailUrl || photo.url, "");
                      if (!src) return null;
                      return (
                        <div key={photo.id} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className={cn(
                              "aspect-square w-full rounded-lg object-cover",
                              photo.isHidden && "opacity-40"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTarget(photo);
                              setMediaReasonInput("");
                            }}
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
                            aria-label={photo.isHidden ? "نمایش تصویر" : "مخفی کردن تصویر"}
                          >
                            {photo.isHidden ? (
                              <EyeSlashIcon size={13} />
                            ) : (
                              <EyeIcon size={13} />
                            )}
                          </button>
                          {photo.isHidden ? (
                            <span className="absolute bottom-1 right-1 rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground-muted">
                              مخفی
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {mediaTarget ? (
                    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border p-3">
                      <p className="text-[12px] font-bold text-foreground">
                        {mediaTarget.isHidden
                          ? "نمایش دوبارهٔ این تصویر در کاتالوگ عمومی"
                          : "مخفی کردن این تصویر از کاتالوگ عمومی"}
                      </p>
                      <TextArea
                        value={mediaReasonInput}
                        onChange={(e) => setMediaReasonInput(e.target.value)}
                        placeholder="دلیل را بنویسید"
                        className="min-h-16"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={mediaTarget.isHidden ? "default" : "destructive"}
                          className="flex-1"
                          disabled={!mediaReasonInput.trim()}
                          isLoading={isMediaActionPending}
                          onClick={handleMediaVisibility}
                        >
                          {mediaTarget.isHidden ? "ثبت نمایش تصویر" : "ثبت مخفی‌سازی"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isMediaActionPending}
                          onClick={() => {
                            setMediaTarget(null);
                            setMediaReasonInput("");
                          }}
                        >
                          انصراف
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {salon ? (
          <DrawerFooter className="border-t border-border">
            {mode === "reject" || mode === "suspend" || mode === "restore" ? (
              <div className="flex flex-col gap-2">
                <TextArea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder={
                    mode === "reject"
                      ? "دلیل رد را بنویسید (برای مالک پیامک می‌شود)"
                      : mode === "suspend"
                        ? "دلیل تعلیق را بنویسید (برای مالک پیامک می‌شود)"
                        : "دلیل بازگرداندن را بنویسید"
                  }
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button
                    variant={mode === "restore" ? "default" : "destructive"}
                    className="flex-1"
                    disabled={!reasonInput.trim()}
                    isLoading={isPending}
                    onClick={
                      mode === "reject"
                        ? handleReject
                        : mode === "suspend"
                          ? handleSuspend
                          : handleRestore
                    }
                  >
                    {mode === "reject"
                      ? "ثبت رد درخواست"
                      : mode === "suspend"
                        ? "ثبت تعلیق سالن"
                        : "ثبت بازگرداندن سالن"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setMode("idle")}
                    disabled={isPending}
                  >
                    انصراف
                  </Button>
                </div>
              </div>
            ) : mode === "confirm-approve" ? (
              <div className="flex gap-2">
                <Button className="flex-1" isLoading={isPending} onClick={handleApprove}>
                  تایید نهایی سالن
                </Button>
                <Button variant="secondary" onClick={() => setMode("idle")} disabled={isPending}>
                  انصراف
                </Button>
              </div>
            ) : salon.approvalStatus === SalonApprovalStatus.Pending ? (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setMode("confirm-approve")}>
                  تایید سالن
                </Button>
                <Button variant="destructive" onClick={() => setMode("reject")}>
                  رد درخواست
                </Button>
              </div>
            ) : salon.trustStatus === TrustStatus.Suspended ? (
              <Button className="w-full" onClick={() => setMode("restore")}>
                بازگرداندن سالن
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setMode("suspend")}
              >
                تعلیق سالن
              </Button>
            )}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
