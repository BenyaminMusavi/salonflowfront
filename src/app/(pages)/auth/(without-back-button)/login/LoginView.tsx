"use client";
import React, { Suspense, useEffect, useState } from "react";
import { SignInIcon } from "@phosphor-icons/react";
import PhoneStartFormProvider from "./components/PhoneStartFormProvider";
import PhoneStartForm from "./components/PhoneStartForm";
import { consumeAuthLogoutReason } from "@/shared/utils/authRedirect";

/**
 * «ورود یا ثبت‌نام» — the only auth entry: phone → SMS code. New and existing users take the
 * same path; password login is a secondary link.
 */
const LoginView = () => {
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  useEffect(() => {
    const reason = consumeAuthLogoutReason();
    if (reason === "membership") {
      setLogoutNotice("عضویت سالن دیگر فعال نیست. دوباره با حساب مشتری وارد شوید.");
    } else if (reason === "expired") {
      setLogoutNotice("نشست شما منقضی شد. دوباره وارد شوید.");
    }
  }, []);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-1">
        <h2 className="flex items-center gap-x-1">
          <SignInIcon className="w-5 text-foreground" weight="bold" />
          <span className="text-[20px] font-semibold text-foreground">ورود یا ثبت‌نام</span>
        </h2>
        <span className="text-[14px] leading-6 text-foreground/60">
          شماره موبایل خود را وارد کنید تا کد تأیید برایتان پیامک شود. اگر حساب ندارید، همین‌جا ساخته می‌شود.
        </span>
        {logoutNotice ? (
          <p className="mt-2 rounded-2xl bg-error/10 px-3 py-2 text-[13px] text-error">{logoutNotice}</p>
        ) : null}
      </div>
      <PhoneStartFormProvider>
        <Suspense fallback={null}>
          <PhoneStartForm />
        </Suspense>
      </PhoneStartFormProvider>
    </div>
  );
};

export default LoginView;
