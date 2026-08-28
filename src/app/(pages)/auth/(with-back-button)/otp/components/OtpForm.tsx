"use client";
import React from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/shared/components/primitives/button/Button";
import { useFormLoading } from "@/shared/contexts/FormLoadingContext";
import { InputOtpReactHookForm } from "@/shared/components/primitives/input/InputOtpReactHookForm";
import OtpResendButton from "@/app/(pages)/auth/(with-back-button)/otp/components/OtpResendButton";
import AcceptedTermsField from "@/app/(pages)/auth/(with-back-button)/otp/components/AcceptedTermsField";
import { TOtpFormSchema } from "@/app/(pages)/auth/(with-back-button)/otp/components/otpFormSchema";

function OtpForm() {
  const { control } = useFormContext<TOtpFormSchema>();
  const isLoading = useFormLoading();

  return (
    <div className={"w-full flex justify-center"}>
      <div
        className={"w-full py-6 items-center flex flex-col gap-x-2 gap-y-4 "}
      >
        <div className={"flex w-full"}>
          <InputOtpReactHookForm
            control={control}
            name="otp"
            label="کد تایید"
            length={6}
          />
        </div>

        <div className={"flex w-full"}>
          <AcceptedTermsField control={control} />
        </div>

        <div className={"flex flex-col gap-y-4 w-full pt-5"}>
          <Button className={"w-full flex gap-x-2 items-center"} isLoading={isLoading}>
            <span className={"mt-[1px]"}>تایید و ادامه</span>
            <CaretLeft size={20} weight="bold" />
          </Button>

          <OtpResendButton />
        </div>
      </div>
    </div>
  );
}

export default OtpForm;
