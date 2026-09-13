"use client";
import React from "react";
import { CaretLeft, UserIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { InputReactHookForm } from "@/shared/components/primitives/input/InputReactHookForm";
import { Button } from "@/shared/components/primitives/button/Button";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import { TEditNameFormSchema } from "./editNameFormSchema";

function EditNameForm() {
  const { control } = useFormContext<TEditNameFormSchema>();
  const isLoading = useFormLoading();

  return (
    <div className={"w-full flex justify-center"}>
      <div
        className={"w-full py-6 items-center flex flex-col gap-x-2 gap-y-4 "}
      >
        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<UserIcon size={20} />}
            label={"نام"}
            placeholder={"نام خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"firstName"}
            autoComplete={"given-name"}
          />
        </div>

        <div className={"flex w-full"}>
          <InputReactHookForm
            startIcon={<UserIcon size={20} />}
            label={"نام خانوادگی"}
            placeholder={"نام خانوادگی خود را وارد کنید"}
            className={"h-full"}
            control={control}
            name={"lastName"}
            autoComplete={"family-name"}
          />
        </div>

        <div className={"flex flex-col w-full pt-5"}>
          <Button className={"w-full flex gap-x-2 items-center"} isLoading={isLoading}>
            <span className={"mt-[1px]"}>ذخیره تغییرات</span>
            <CaretLeft size={20} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditNameForm;
