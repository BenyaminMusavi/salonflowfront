"use client";

import { useEffect, useState } from "react";
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
} from "@/services/domains/admin/hooks/useMutateAdminSalonActions";
import {
  formatAdminDate,
  salonApprovalStatusLabel,
  salonApprovalStatusVariant,
} from "@/services/domains/admin/utils/admin-salon-display";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { SalonApprovalStatus } from "@/services/common/enums/domain-enums";

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

export function SalonDetailDrawer({
  publicId,
  onClose,
}: {
  publicId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQueryAdminSalonDetail(publicId);
  const salon = data?.data;

  const [mode, setMode] = useState<"idle" | "confirm-approve" | "reject">("idle");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setMode("idle");
    setRejectReason("");
  }, [publicId]);

  const { mutateAsync: approve, isPending: isApproving } = useMutateApproveSalon();
  const { mutateAsync: reject, isPending: isRejecting } = useMutateRejectSalon();

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
    if (!publicId || !rejectReason.trim()) return;
    try {
      await reject({ publicId, data: { reason: rejectReason.trim() } });
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  return (
    <Drawer
      open={!!publicId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent
        showHandle={false}
        className="w-full sm:max-w-md"
      >
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">
            {isLoading ? "در حال بارگذاری…" : salon?.name ?? "جزئیات سالن"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            جزئیات کامل سالن برای تصمیم تایید یا رد
          </DrawerDescription>
          {salon ? (
            <Badge
              variant={salonApprovalStatusVariant(salon.approvalStatus)}
              className="mt-1 w-fit"
            >
              {salonApprovalStatusLabel(salon.approvalStatus)}
            </Badge>
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={photo.id}
                          src={src}
                          alt=""
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {salon && salon.approvalStatus === SalonApprovalStatus.Pending ? (
          <DrawerFooter className="border-t border-border">
            {mode === "reject" ? (
              <div className="flex flex-col gap-2">
                <TextArea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="دلیل رد را بنویسید (برای مالک پیامک می‌شود)"
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!rejectReason.trim()}
                    isLoading={isRejecting}
                    onClick={handleReject}
                  >
                    ثبت رد درخواست
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setMode("idle")}
                    disabled={isRejecting}
                  >
                    انصراف
                  </Button>
                </div>
              </div>
            ) : mode === "confirm-approve" ? (
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  isLoading={isApproving}
                  onClick={handleApprove}
                >
                  تایید نهایی سالن
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setMode("idle")}
                  disabled={isApproving}
                >
                  انصراف
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setMode("confirm-approve")}>
                  تایید سالن
                </Button>
                <Button variant="destructive" onClick={() => setMode("reject")}>
                  رد درخواست
                </Button>
              </div>
            )}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
