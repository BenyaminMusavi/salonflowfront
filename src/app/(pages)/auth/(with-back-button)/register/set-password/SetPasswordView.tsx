import React from "react";
import SetPasswordFormProvider from "@/app/(pages)/auth/(with-back-button)/register/set-password/components/SetPasswordFormProvider";
import SetPasswordForm from "@/app/(pages)/auth/(with-back-button)/register/set-password/components/SetPasswordForm";

const SetPasswordView = () => {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <span className={"text-foreground text-[20px] font-semibold"}>
            تکمیل حساب
          </span>
        </h2>
        <span className={"text-foreground/60 text-[14px]"}>
          فقط یک بار: نام خود را بنویسید تا سالن‌ها شما را بشناسند.
        </span>
      </div>
      <SetPasswordFormProvider>
        <SetPasswordForm />
      </SetPasswordFormProvider>
    </div>
  );
};

export default SetPasswordView;
