"use client";
import React from "react";
import { CaretDownIcon, CaretLeft, LockKey, UserIcon } from "@phosphor-icons/react";
import { useFormContext, useWatch } from "react-hook-form";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { Button } from "@/shared/components/primitives/button/Button";
import { PasswordRequirements } from "@/shared/components/composites/password-requirements/PasswordRequirements";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import { cn } from "@/shared/utils/className";
import { TSetPasswordFormSchema } from "./setPasswordFormSchema";

function SetPasswordForm() {
  const { control, setValue, clearErrors } = useFormContext<TSetPasswordFormSchema>();
  const askName = useWatch({ control, name: "askName" });
  const withPassword = useWatch({ control, name: "withPassword" });
  const password = useWatch({ control, name: "password" }) as string | undefined;
  const isLoading = useFormLoading();

  const togglePassword = () => {
    setValue("withPassword", !withPassword);
    if (withPassword) {
      setValue("password", "");
      setValue("repeatPassword", "");
      clearErrors(["password", "repeatPassword"]);
    }
  };

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full flex-col items-center gap-y-4 py-6">
        {askName ? (
          <div className="grid w-full grid-cols-2 gap-3">
            <InputReactHookForm
              startIcon={<UserIcon size={20} />}
              label="نام"
              placeholder="مثلاً سارا"
              className="h-full"
              control={control}
              name="firstName"
              autoComplete="given-name"
              autoFocus
            />
            <InputReactHookForm
              label="نام خانوادگی"
              placeholder="مثلاً احمدی"
              className="h-full"
              control={control}
              name="lastName"
              autoComplete="family-name"
            />
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-3 rounded-[16px] bg-background-secondary p-4">
          <button
            type="button"
            onClick={togglePassword}
            aria-expanded={withPassword}
            className="flex w-full items-center justify-between text-right"
          >
            <span>
              <span className="block text-sm font-semibold text-foreground">رمز عبور (اختیاری)</span>
              <span className="block text-xs leading-5 text-foreground-muted">
                ورود همیشه با کد پیامکی ممکن است. رمز فقط برای ورود بدون پیامک است.
              </span>
            </span>
            <CaretDownIcon size={16} className={cn("shrink-0 text-foreground-muted transition-transform", withPassword && "rotate-180")} />
          </button>
          {withPassword ? (
            <>
              <div className="flex w-full flex-col gap-2">
                <InputReactHookForm
                  startIcon={<LockKey size={20} />}
                  label="رمز عبور"
                  placeholder="رمز عبور خود را وارد کنید"
                  className="h-full"
                  control={control}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                />
                <PasswordRequirements value={password} />
              </div>
              <InputReactHookForm
                startIcon={<LockKey size={20} />}
                label="تکرار رمز عبور"
                placeholder="رمز عبور خود را دوباره وارد کنید"
                className="h-full"
                control={control}
                name="repeatPassword"
                type="password"
                autoComplete="new-password"
              />
            </>
          ) : null}
        </div>

        <div className="flex w-full flex-col pt-3">
          <Button className="flex w-full items-center gap-x-2" isLoading={isLoading}>
            <span className="mt-[1px]">ذخیره و ادامه</span>
            <CaretLeft size={20} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SetPasswordForm;
