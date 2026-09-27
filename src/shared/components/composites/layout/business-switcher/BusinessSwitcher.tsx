"use client";

import { PlusIcon, CaretLeftIcon, SignOutIcon, UserIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useSelectPanelSalon } from "@/services/salon-context-store/useSelectPanelSalon";
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

  const { data } = useQueryAuthMe();
  const selectSalon = useSelectPanelSalon();
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutateLogout();

  const displayInitial = data?.data?.firstName?.charAt(0) ?? "?";

  // ADR-0012: opening a salon's panel is just navigation; no token swap.
  const handleOpenPanel = (membership: ISalonMembership) => {
    selectSalon(membership);
    setOpen(false);
    router.push(RouteAddress.DASHBOARD.BASE);
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
        {memberships.length > 0 ? (
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
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {memberships.length > 0 ? (
              <>
                <p className="text-[13px] font-semibold text-foreground-muted">
                  ورود به پنل سالن
                </p>
                {memberships.map((m) => (
                  <button
                    key={m.salonPublicId ?? m.salonId}
                    type="button"
                    onClick={() => handleOpenPanel(m)}
                    className="flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-right transition-colors hover:bg-background-tertiary"
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
                    <CaretLeftIcon size={18} className="text-foreground-muted" />
                  </button>
                ))}
              </>
            ) : null}

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

            {data?.data?.isAdmin ? (
              <button
                type="button"
                className="flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-right transition-colors hover:bg-background-tertiary"
                onClick={() => {
                  setOpen(false);
                  router.push(RouteAddress.ADMIN.BASE);
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary">
                  <ShieldCheckIcon size={18} className="text-primary" />
                </div>
                <span className="flex-1 text-[14px] font-bold text-foreground">
                  پنل مدیریت
                </span>
                <CaretLeftIcon size={18} className="text-foreground-muted" />
              </button>
            ) : null}
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
