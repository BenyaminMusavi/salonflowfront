"use client";
import React, { Suspense } from "react";
import { CaretLeft, DeviceMobile, LinkSimple } from "@phosphor-icons/react";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { useFormContext } from "react-hook-form";
import { Button } from "@/shared/components/primitives/button/Button";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";
import { buildAuthHref } from "@/shared/utils/authRedirect";

function RegisterFormInner() {
  const { control } = useFormContext();
  const isLoading = useFormLoading();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");
  const loginHref = buildAuthHref(RouteAddress.AUTH.LOGIN.BASE, callback);

  return (
    <div className={"w-full flex justify-center"}>
      <div
        className={"w-full py-6 items-center flex flex-col gap-x-2 gap-y-4 "}
      >
        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<DeviceMobile size={20} />}
            label={"شماره موبایل"}
            placeholder={"شماره موبایل خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"phone"}
          />
        </div>

        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<LinkSimple size={20} />}
            type={"text"}
            label={"کد معرف (اختیاری)"}
            placeholder={"کد معرف خود را وارد نمایید"}
            className={"h-full"}
            control={control}
            name={"referralCode"}
          />
        </div>

        <div className={"flex flex-col w-full pt-5"}>
          <Button
            className={"w-full flex gap-x-2 items-center"}
            isLoading={isLoading}
          >
            <span className={"mt-[1px]"}>ارسال کد تایید</span>
            <CaretLeft size={20} weight="bold" />
          </Button>
        </div>
        <div className={"flex flex-col gap-y-6 w-full items-center py-5"}>
          <span className={"w-full h-px bg-border"} />

          <div className={"flex gap-x-2 items-center"}>
            <span className={"text-foreground/60"}>حساب کاربری دارید؟</span>
            <Link className={"text-primary"} href={loginHref}>
              وارد شوید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterForm() {
  return (
    <Suspense fallback={null}>
      <RegisterFormInner />
    </Suspense>
  );
}

export default RegisterForm;
