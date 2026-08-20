"use client";
import React, { useEffect, useState } from "react";
import { SignInIcon } from "@phosphor-icons/react";
import LoginFormProvider from "@/app/(pages)/auth/(without-back-button)/login/components/LoginFormProvider";
import LoginForm from "./components/LoginForm";
import { FormErrorProvider } from "@/shared/hooks/useFormError";
import { consumeAuthLogoutReason } from "@/shared/utils/authRedirect";

const LoginView = () => {
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  useEffect(() => {
    const reason = consumeAuthLogoutReason();
    if (reason === "membership") {
      setLogoutNotice(
        "عضویت سالن دیگر فعال نیست. دوباره با حساب مشتری وارد شوید."
      );
    } else if (reason === "expired") {
      setLogoutNotice("نشست شما منقضی شد. دوباره وارد شوید.");
    }
  }, []);

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
        {logoutNotice ? (
          <p className="mt-2 rounded-2xl bg-error/10 px-3 py-2 text-[13px] text-error">
            {logoutNotice}
          </p>
        ) : null}
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
