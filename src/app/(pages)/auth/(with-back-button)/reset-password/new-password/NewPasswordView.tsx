import React from "react";
import NewPasswordForm from "@/app/(pages)/auth/(with-back-button)/reset-password/new-password/components/NewPasswordForm";
import NewPasswordFormProvider
  from "@/app/(pages)/auth/(with-back-button)/reset-password/new-password/components/NewPasswordFormProvider";

const NewPasswordView = () => {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <span className={"text-foreground text-[20px] font-semibold"}>
            فراموشی رمز عبور
          </span>
        </h2>
        <span className={"text-foreground/60 text-[14px]"}>
          رمزعبور جدید خود را وارد کنید.
        </span>
      </div>
      <NewPasswordFormProvider>
        <NewPasswordForm />
      </NewPasswordFormProvider>
    </div>
  );
};

export default NewPasswordView;
