"use client";

import React from "react";
import { LockKeyIcon } from "@phosphor-icons/react";
import LoginFormProvider from "@/app/(pages)/auth/(without-back-button)/login/components/LoginFormProvider";
import LoginForm from "@/app/(pages)/auth/(without-back-button)/login/components/LoginForm";
import { FormErrorProvider } from "@/shared/hooks/useFormError";

/** «ورود با رمز عبور» — the secondary way in, for people who set a password. */
const PasswordLoginView = () => (
  <div className="flex flex-col gap-y-4">
    <div className="flex flex-col gap-y-1">
      <h2 className="flex items-center gap-x-1">
        <LockKeyIcon className="w-5 text-foreground" weight="bold" />
        <span className="text-[20px] font-semibold text-foreground">ورود با رمز عبور</span>
      </h2>
      <span className="text-[14px] text-foreground/60">شماره موبایل و رمز عبور خود را وارد کنید.</span>
    </div>
    <FormErrorProvider>
      <LoginFormProvider>
        <LoginForm />
      </LoginFormProvider>
    </FormErrorProvider>
  </div>
);

export default PasswordLoginView;
