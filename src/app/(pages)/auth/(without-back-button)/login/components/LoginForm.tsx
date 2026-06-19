"use client";
import React from "react";
import { CaretLeft, DeviceMobile, LockKey } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { Button } from "@/shared/components/primitives/button/Button";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";

function LoginForm() {
  const { control } = useFormContext();
  const isLoading = useFormLoading();

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
            startIcon={<LockKey size={20} />}
            label={"رمز عبور"}
            placeholder={"رمز عبور خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"password"}
            type={"password"}
          />
        </div>

        <div className={"flex flex-col w-full pt-5"}>
          <Button className={"w-full flex gap-x-2 items-center"} isLoading={isLoading}>
            <span className={"mt-[1px]"}>ورود به حساب کاربری</span>
            <CaretLeft size={20} weight="bold" />
          </Button>
        </div>

        <div className={"flex flex-col gap-y-6 w-full items-center py-5"}>
          <div>
            <Link className={"text-primary text-[14px]"} href={RouteAddress.AUTH.RESET_PASSWORD.BASE}>رمز عبور خود را فراموش کرده‌اید؟</Link>
          </div>

          <span className={"w-full h-px bg-border"} />

          <div className={"flex gap-x-2 items-center"}>
            <span className={"text-foreground/60"}>حساب کاربری ندارید؟</span>
            <Link className={"text-primary"} href={RouteAddress.AUTH.REGISTER.BASE}>ثبت نام کنید</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
