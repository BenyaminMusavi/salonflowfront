import React from "react";
import ResetVerifyFormProvider from "@/app/(pages)/auth/(with-back-button)/reset-password/verify/components/ResetVerifyFormProvider";
import ResetVerifyForm from "@/app/(pages)/auth/(with-back-button)/reset-password/verify/components/ResetVerifyForm";

const ResetVerifyView = () => {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <span className={"text-foreground text-[20px] font-semibold"}>
            فراموشی رمز عبور
          </span>
        </h2>
        {/* Neutral on purpose: the backend never reveals whether a code was actually sent. */}
        <span className={"text-foreground/60 text-[14px]"}>
          کد تایید 6 رقمی را وارد کنید.
        </span>
      </div>
      <ResetVerifyFormProvider>
        <ResetVerifyForm />
      </ResetVerifyFormProvider>
    </div>
  );
};

export default ResetVerifyView;
