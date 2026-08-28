"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import ChangePasswordFormProvider from "./components/ChangePasswordFormProvider";
import ChangePasswordForm from "./components/ChangePasswordForm";

const ChangePasswordView = () => {
  const router = useRouter();

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
