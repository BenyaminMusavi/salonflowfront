"use client";

import { PlusIcon, CaretLeftIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { useMutateLogout } from "@/services/domains/auth/hooks/useMutateLogout";
import {
  useSalonContextStore,
  ISalonMembership,
} from "@/services/salon-context-store/useSalonContextStore";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function BusinessSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const memberships = useSalonContextStore((s) => s.memberships);
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonName = useSalonContextStore((s) => s.salonName);

  const { data } = useQueryAuthMe();
  const { mutateAsync: switchContext, isPending: isSwitching } =
    useMutateSwitchContext();
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutateLogout();

  const activeMembership = memberships.find((m) => m.salonId === salonId);
  const displayInitial =
    activeMembership?.name?.charAt(0) ??
    salonName?.charAt(0) ??
    data?.data?.firstName?.charAt(0) ??
    "?";

  const handleSwitchToCustomer = async () => {
    try {
      await switchContext({ salonId: null, branchId: null });
      setOpen(false);
    } catch {
      /* errors surface via network; keep sheet open */
    }
  };

  const handleSwitchSalon = async (membership: ISalonMembership) => {
    try {
      await switchContext({
        salonId: membership.salonId,
        branchId: membership.branchId ?? null,
        salonName: membership.name,
        salonPublicId: membership.salonPublicId,
        roleId: membership.roleId,
        roleName: membership.roleName,
      });
      setOpen(false);
      router.push(RouteAddress.DASHBOARD.BASE);
    } catch {
      /* keep sheet open on failure */
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);
      router.push(RouteAddress.AUTH.LOGIN.BASE);
    }
  };

  const fullName =
    `${data?.data?.firstName ?? ""} ${data?.data?.lastName ?? ""}`.trim() ||
    "کاربر";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {salonId != null || memberships.length > 0 ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-[14px] font-bold">
            {displayInitial}
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserIcon size={20} weight="bold" />
          </div>
        )}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-[16px] bg-background-secondary px-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background-tertiary text-[16px] font-bold text-foreground">
              <UserIcon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-foreground-muted">حساب فعلی</p>
              <p className="text-[14px] font-bold text-foreground">{fullName}</p>
              <p className="text-[12px] text-foreground-muted" dir="ltr">
                {data?.data?.phone}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground-muted">
                {salonId != null
                  ? `کانتکست سالن: ${activeMembership?.name ?? salonName ?? salonId}`
                  : "کانتکست مشتری"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-foreground-muted">
              تعویض کانتکست
            </p>

            <button
              type="button"
              disabled={isSwitching || salonId == null}
              onClick={handleSwitchToCustomer}
              className={`flex items-center gap-3 rounded-[16px] p-4 text-right transition-colors disabled:opacity-50 ${
                salonId == null
                  ? "bg-primary/10 ring-1 ring-primary"
                  : "bg-background-secondary"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary text-[14px] font-bold text-foreground">
                <UserIcon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-foreground">
                  حساب شخصی (مشتری)
                </p>
                <p className="text-[12px] text-foreground-muted">
                  مرور و رزرو بدون کانتکست سالن
                </p>
              </div>
              {salonId == null && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>

            {memberships.length === 0 ? (
              <p className="px-1 text-[12px] text-foreground-muted">
                هنوز کسب‌وکاری ندارید. با «افزودن کسب و کار» سالن بسازید یا اگر
                عضویت دارید کمی صبر کنید تا لیست بارگذاری شود.
              </p>
            ) : (
              memberships.map((m) => (
                <button
                  key={m.salonId}
                  type="button"
                  disabled={isSwitching}
                  onClick={() => handleSwitchSalon(m)}
                  className={`flex items-center gap-3 rounded-[16px] p-4 text-right transition-colors disabled:opacity-50 ${
                    m.salonId === salonId
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-background-secondary"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary text-[14px] font-bold text-foreground">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-foreground">
                      {m.name}
                    </p>
                    {m.roleName ? (
                      <p className="text-[12px] text-foreground-muted">
                        {m.roleName}
                      </p>
                    ) : null}
                  </div>
                  {m.salonId === salonId && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}

            <button
              type="button"
              className="flex items-center gap-3 rounded-[16px] border border-dashed border-border p-4 text-right transition-colors hover:bg-background-secondary"
              onClick={() => {
                setOpen(false);
                router.push(RouteAddress.ONBOARDING.BASE);
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary">
                <PlusIcon size={18} className="text-primary" />
              </div>
              <span className="flex-1 text-[14px] font-bold text-foreground">
                افزودن کسب و کار
              </span>
              <CaretLeftIcon size={18} className="text-foreground-muted" />
            </button>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="mt-2 flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-right disabled:opacity-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary">
              <SignOutIcon size={18} className="text-error" />
            </div>
            <span className="flex-1 text-[14px] font-bold text-foreground">
              خروج از حساب
            </span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
