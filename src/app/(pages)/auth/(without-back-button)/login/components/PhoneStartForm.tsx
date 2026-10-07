"use client";

import { CaretLeftIcon, DeviceMobileIcon, LockKeyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/shared/components/primitives/button/Button";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import { useAuthPhoneStore } from "@/services/authentication-store/useAuthPhoneStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { buildAuthHref } from "@/shared/utils/authRedirect";
import { normalizePhoneInput, PHONE_INPUT_ATTRS } from "@/shared/utils/phoneInput";
import type { TPhoneStartFormSchema } from "./phoneStartFormSchema";

function PhoneStartForm() {
  const { control, getValues } = useFormContext<TPhoneStartFormSchema>();
  const isLoading = useFormLoading();
  const setPhone = useAuthPhoneStore((s) => s.setPhone);
  const callback = useSearchParams().get("callback");

  return (
    <div className="flex w-full flex-col items-center gap-4 py-6">
      <div className="flex w-full">
        <InputReactHookForm
          startIcon={<DeviceMobileIcon size={20} />}
          label="شماره موبایل"
          placeholder="09xxxxxxxxx"
          className="h-full"
          control={control}
          name="phone"
          type={PHONE_INPUT_ATTRS.type}
          inputMode={PHONE_INPUT_ATTRS.inputMode}
          dir={PHONE_INPUT_ATTRS.dir}
          inputClassName={PHONE_INPUT_ATTRS.className}
          autoComplete="tel"
          autoFocus
          transformValue={normalizePhoneInput}
        />
      </div>

      <div className="flex w-full flex-col pt-3">
        <Button className="flex w-full items-center gap-x-2" isLoading={isLoading}>
          <span className="mt-[1px]">دریافت کد تأیید</span>
          <CaretLeftIcon size={20} weight="bold" />
        </Button>
      </div>

      <div className="flex w-full flex-col items-center gap-y-5 py-4">
        <span className="h-px w-full bg-border" />
        <Link
          href={buildAuthHref(RouteAddress.AUTH.PASSWORD.BASE, callback)}
          onClick={() => setPhone(normalizePhoneInput(getValues("phone") ?? ""))}
          className="flex items-center gap-2 text-[14px] text-primary"
        >
          <LockKeyIcon size={18} />
          ورود با رمز عبور
        </Link>
      </div>
    </div>
  );
}

export default PhoneStartForm;
