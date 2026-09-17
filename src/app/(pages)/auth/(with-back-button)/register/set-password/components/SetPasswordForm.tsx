"use client";
import React from "react";
import { CaretLeft, LockKey } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { Button } from "@/shared/components/primitives/button/Button";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import { TSetPasswordFormSchema } from "./setPasswordFormSchema";

function SetPasswordForm() {
  const { control } = useFormContext<TSetPasswordFormSchema>();
  const isLoading = useFormLoading();

  return (
    <div className={"w-full flex justify-center"}>
      <div
        className={"w-full py-6 items-center flex flex-col gap-x-2 gap-y-4 "}
      >
        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<LockKey size={20} />}
            label={"رمز عبور"}
            placeholder={"رمز عبور خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"password"}
            type={"password"}
            autoComplete={"new-password"}
          />
        </div>

        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<LockKey size={20} />}
            label={"تکرار رمز عبور"}
            placeholder={"رمز عبور خود را دوباره وارد کنید"}
            className={"h-full"}
            control={control}
            name={"repeatPassword"}
            type={"password"}
            autoComplete={"new-password"}
          />
        </div>

        <div className={"flex flex-col w-full pt-5"}>
          <Button className={"w-full flex gap-x-2 items-center"} isLoading={isLoading}>
            <span className={"mt-[1px]"}>ذخیره و ادامه</span>
            <CaretLeft size={20} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SetPasswordForm;
