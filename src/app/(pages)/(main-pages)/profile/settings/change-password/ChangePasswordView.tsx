"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import ChangePasswordFormProvider from "./components/ChangePasswordFormProvider";
import ChangePasswordForm from "./components/ChangePasswordForm";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";

const ChangePasswordView = () => {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-4 px-safe-area pb-32 pt-10 text-center">
        <h1 className="text-lg font-bold text-foreground">تنظیمات امنیتی</h1>
        <p className="text-sm text-foreground-muted">
          برای تغییر رمز عبور ابتدا وارد حساب کاربری شوید.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push(getLoginHref(RouteAddress.PROFILE.CHANGE_PASSWORD));
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 px-safe-area">
      <div className="flex items-center gap-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
          aria-label="بازگشت"
        >
          <ArrowRight size={20} className="text-foreground" />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">تغییر رمز عبور</h1>
      </div>

      <ChangePasswordFormProvider>
        <ChangePasswordForm />
      </ChangePasswordFormProvider>
    </div>
  );
};

export default ChangePasswordView;
