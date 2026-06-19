import React from "react";
import RegisterFormProvider from "@/app/(pages)/auth/(without-back-button)/register/components/RegisterFormProvider";
import RegisterForm from "@/app/(pages)/auth/(without-back-button)/register/components/RegisterForm";

const RegisterView = () => {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <span className={"text-foreground text-[20px] font-semibold"}>
            ثبت نام
          </span>
        </h2>
        <span className={"text-foreground/60 text-[14px]"}>
          برای ثبت نام شماره موبایل خود را وارد کنید.
        </span>
      </div>
      <RegisterFormProvider>
        <RegisterForm />
      </RegisterFormProvider>
    </div>
  );
};

export default RegisterView;
