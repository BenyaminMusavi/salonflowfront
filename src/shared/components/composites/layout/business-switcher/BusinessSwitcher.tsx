"use client";

import { PlusIcon, CaretLeftIcon, SignOutIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useBusinessStore } from "@/services/business-store/useBusinessStore";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { UserIcon } from "@phosphor-icons/react/ssr";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";

export default function BusinessSwitcher() {
  const { businesses, activeBusinessId, addBusiness, setActiveBusiness } =
    useBusinessStore();
  const [open, setOpen] = useState(false);

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId);

  const handleAddBusiness = () => {
    const id = crypto.randomUUID();
    addBusiness({
      id,
      name: `کسب و کار ${businesses.length + 1}`,
      phone: "09123456789",
      address: "تهران، ایران",
    });
    setActiveBusiness(id);
    setOpen(false);
  };

  const handleSwitch = (id: string) => {
    setActiveBusiness(id);
    setOpen(false);
  };

  const {data, isLoading} = useQueryAuthMe()

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {businesses.length > 0 ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-[14px] font-bold">
            {activeBusiness?.name.charAt(0) ?? "?"}
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PlusIcon size={20} weight="bold" />
          </div>
        )}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-[16px] bg-background-secondary py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background-tertiary text-[16px] font-bold text-foreground">
              <UserIcon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-foreground">
                {(data?.data.firstName || "") + " " + (data?.data.lastName || "")}
              </p>
              <p className="text-[12px] text-foreground-muted">
                {data?.data.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-foreground-muted">
              کسب و کارها
            </p>

            {businesses.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSwitch(b.id)}
                className={`flex items-center gap-3 rounded-[16px] p-4 text-right transition-colors ${
                  b.id === activeBusinessId
                    ? "bg-primary/10 ring-1 ring-primary"
                    : "bg-background-secondary"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary text-[14px] font-bold text-foreground">
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-foreground">
                    {b.name}
                  </p>
                  <p className="text-[12px] text-foreground-muted">
                    {b.address}
                  </p>
                </div>
                {b.id === activeBusinessId && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={handleAddBusiness}
              className="flex items-center gap-3 rounded-[16px] border border-dashed border-border p-4 text-right transition-colors hover:bg-background-secondary"
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
            className="mt-2 flex items-center gap-3 rounded-[16px] bg-background-secondary p-4 text-right"
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
