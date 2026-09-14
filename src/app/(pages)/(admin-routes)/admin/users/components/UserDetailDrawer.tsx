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
import { useQueryAdminUserDetail } from "@/services/domains/admin/hooks/useQueryAdminUserDetail";
import {
  useMutateBlockUser,
  useMutateUnblockUser,
} from "@/services/domains/admin/hooks/useMutateAdminUserActions";
import { formatAdminDate } from "@/services/domains/admin/utils/admin-salon-display";

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

type Mode = "idle" | "block" | "confirm-unblock";

export function UserDetailDrawer({
  userPublicId,
  onClose,
}: {
  userPublicId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useQueryAdminUserDetail(userPublicId);
  const user = data?.data;

  const [mode, setMode] = useState<Mode>("idle");
  const [reasonInput, setReasonInput] = useState("");

  useEffect(() => {
    setMode("idle");
    setReasonInput("");
  }, [userPublicId]);

  const { mutateAsync: block, isPending: isBlocking } = useMutateBlockUser();
  const { mutateAsync: unblock, isPending: isUnblocking } = useMutateUnblockUser();
  const isPending = isBlocking || isUnblocking;

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "بدون نام"
    : "";

  const handleBlock = async () => {
    if (!userPublicId || !reasonInput.trim()) return;
    try {
      await block({ userPublicId, data: { reason: reasonInput.trim() } });
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  const handleUnblock = async () => {
    if (!userPublicId) return;
    try {
      await unblock(userPublicId);
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  return (
    <Drawer
      open={!!userPublicId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent showHandle={false} className="w-full sm:max-w-md">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">
            {isLoading ? "در حال بارگذاری…" : fullName || "جزئیات کاربر"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            جزئیات کامل کاربر برای مدیریت دسترسی
          </DrawerDescription>
          {user ? (
            <Badge variant={user.isBlocked ? "error" : "success"} className="mt-1 w-fit">
              {user.isBlocked ? "مسدود" : "فعال"}
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
          ) : user ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 text-[11px] font-bold text-foreground-muted">پروفایل</p>
                <InfoRow label="شماره تماس" value={user.phone} />
                <InfoRow label="تاریخ عضویت" value={formatAdminDate(user.createdAt)} />
                <InfoRow
                  label="آخرین ورود"
                  value={user.lastLoginAt ? formatAdminDate(user.lastLoginAt) : "—"}
                />
                {user.isBlocked ? (
                  <>
                    <InfoRow
                      label="تاریخ مسدودسازی"
                      value={user.blockedAt ? formatAdminDate(user.blockedAt) : "—"}
                    />
                    <InfoRow label="دلیل مسدودسازی" value={user.blockReason} />
                  </>
                ) : null}
              </div>

              {user.globalRoles.length > 0 ? (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold text-foreground-muted">
                    نقش‌های سراسری
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.globalRoles.map((role) => (
                      <Badge key={role} variant="brand">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {user.memberships.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-bold text-foreground-muted">
                    عضویت در سالن‌ها ({user.memberships.length.toLocaleString("fa-IR")})
                  </p>
                  <div className="flex flex-col gap-2">
                    {user.memberships.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border p-2.5 text-[12px]"
                      >
                        <p className="font-bold text-foreground">{m.salonName}</p>
                        <p className="mt-0.5 text-foreground-muted">
                          {m.roleName} — {m.isActive ? "فعال" : "غیرفعال"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {user ? (
          <DrawerFooter className="border-t border-border">
            {mode === "block" ? (
              <div className="flex flex-col gap-2">
                <TextArea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="دلیل مسدودسازی را بنویسید"
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!reasonInput.trim()}
                    isLoading={isPending}
                    onClick={handleBlock}
                  >
                    ثبت مسدودسازی
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
            ) : mode === "confirm-unblock" ? (
              <div className="flex gap-2">
                <Button className="flex-1" isLoading={isPending} onClick={handleUnblock}>
                  تایید رفع مسدودیت
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setMode("idle")}
                  disabled={isPending}
                >
                  انصراف
                </Button>
              </div>
            ) : user.isBlocked ? (
              <Button className="w-full" onClick={() => setMode("confirm-unblock")}>
                رفع مسدودیت
              </Button>
            ) : (
              <Button variant="destructive" className="w-full" onClick={() => setMode("block")}>
                مسدودسازی کاربر
              </Button>
            )}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
