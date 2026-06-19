"use client";
import React from "react";
import { SignInIcon } from "@phosphor-icons/react";
import LoginFormProvider from "@/app/(pages)/auth/(without-back-button)/login/components/LoginFormProvider";
import LoginForm from "./components/LoginForm";
import { FormErrorProvider } from "@/shared/hooks/useFormError";

const LoginView = () => {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <SignInIcon className={"text-foreground w-5"} weight="bold" />
          <span className={"text-foreground text-[20px] font-semibold"}>
            ورود
          </span>
        </h2>
        <span className={"text-foreground/60 text-[14px]"}>
          برای ورود شماره موبایل و رمزعبور خود را وارد کنید.
        </span>
      </div>
      <FormErrorProvider>
        <LoginFormProvider>
          <LoginForm />
        </LoginFormProvider>
      </FormErrorProvider>
    </div>
  );
};

export default LoginView;
