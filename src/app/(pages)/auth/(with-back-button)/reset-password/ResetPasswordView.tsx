import React from "react";
import ResetPasswordFormProvider from "@/app/(pages)/auth/(with-back-button)/reset-password/components/ResetPasswordFormProvider";
import ResetPasswordForm from "@/app/(pages)/auth/(with-back-button)/reset-password/components/ResetPasswordForm";

function ResetPasswordView() {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <span className={"text-foreground text-[20px] font-semibold"}>
            فراموشی رمز عبور
          </span>
        </h2>
        <span className={"text-foreground/60 text-[14px]"}>
         برای بازیابی رمز عبور، شماره موبایل خود را وارد کنید
        </span>
      </div>
      <ResetPasswordFormProvider>
        <ResetPasswordForm />
      </ResetPasswordFormProvider>
    </div>
  );
}

export default ResetPasswordView;