"use client";
import { normalizePhoneInput, PHONE_INPUT_ATTRS } from "@/shared/utils/phoneInput";
import React from "react";
import {
  CaretLeftIcon,
  ChatCircleTextIcon,
  DeviceMobileIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import { useFormContext, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutateSendOtp } from "@/services/domains/auth/hooks/useMutateSendOtp";
import { useAuthPhoneStore } from "@/services/authentication-store/useAuthPhoneStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { Button } from "@/shared/components/primitives/button/Button";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import { useFormError } from "@/shared/hooks/useFormError";

const PHONE_RULE = /^09\d{9}$/;

function LoginForm() {
  const { control } = useFormContext();
  const { generalError, setGeneralError } = useFormError();
  const isLoading = useFormLoading();
  const router = useRouter();
  const sendOtp = useMutateSendOtp();
  const setPhone = useAuthPhoneStore((s) => s.setPhone);
  const phone = normalizePhoneInput((useWatch({ control, name: "phone" }) as string | undefined) ?? "");

  /** Same door as «ورود یا ثبت‌نام»: an SMS code logs an account in or creates it. */
  const loginWithCode = async () => {
    setPhone(phone);
    try {
      await sendOtp.mutateAsync({ phone });
      router.push(`${RouteAddress.AUTH.OTP.BASE}?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setGeneralError(getApiErrorMessage(err, "ارسال کد ناموفق بود."));
    }
  };

  return (
    <div className={"w-full flex justify-center"}>
      <div
        className={"w-full py-6 items-center flex flex-col gap-x-2 gap-y-4 "}
      >
        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<DeviceMobileIcon size={20} />}
            label={"شماره موبایل"}
            placeholder={"شماره موبایل خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"phone"}
            type={PHONE_INPUT_ATTRS.type}

            inputMode={PHONE_INPUT_ATTRS.inputMode}

            dir={PHONE_INPUT_ATTRS.dir}
            inputClassName={PHONE_INPUT_ATTRS.className}
            autoComplete="tel"
            transformValue={normalizePhoneInput}
          />
        </div>

        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<LockKeyIcon size={20} />}
            label={"رمز عبور"}
            placeholder={"رمز عبور خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"password"}
            type={"password"}
          />
        </div>

        {generalError && (
          <div className="flex w-full flex-col gap-3 rounded-[12px] border border-error bg-error/5 px-4 py-3 text-sm text-error">
            <span>{generalError}</span>
            {PHONE_RULE.test(phone) ? (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                isLoading={sendOtp.isPending}
                onClick={() => void loginWithCode()}
              >
                <ChatCircleTextIcon size={18} />
                ورود با کد پیامکی به <span dir="ltr">{phone}</span>
              </Button>
            ) : null}
          </div>
        )}

        <div className={"flex flex-col w-full pt-5"}>
          <Button
            className={"w-full flex gap-x-2 items-center"}
            isLoading={isLoading}
          >
            <span className={"mt-[1px]"}>ورود به حساب کاربری</span>
            <CaretLeftIcon size={20} weight="bold" />
          </Button>
        </div>

        <div className={"flex flex-col gap-y-6 w-full items-center py-5"}>
          <div>
            <Link
              className={"text-primary text-[14px]"}
              href={RouteAddress.AUTH.RESET_PASSWORD.BASE}
            >
              رمز عبور خود را فراموش کرده‌اید؟
            </Link>
          </div>

          <span className={"w-full h-px bg-border"} />

          <Link
            className={"flex items-center gap-2 text-primary text-[14px]"}
            href={RouteAddress.AUTH.LOGIN.BASE}
            onClick={() => setPhone(phone)}
          >
            <ChatCircleTextIcon size={18} />
            ورود یا ثبت‌نام با کد پیامکی
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
