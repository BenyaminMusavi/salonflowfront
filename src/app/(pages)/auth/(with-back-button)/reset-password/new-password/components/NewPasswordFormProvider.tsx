"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newPasswordFormSchema,
  TNewPasswordFormSchema,
} from "./newPasswordFormSchema";
import { useResetPassword } from "@/services/domains/auth/hooks/useMutateResetPassword";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useResetPasswordStore } from "@/services/authentication-store/useResetPasswordStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { resolvePostLoginRedirect } from "@/shared/utils/authRedirect";
import { RouteAddress } from "@/shared/data/routeAddress";

interface IProps {
  children: ReactNode;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= Date.now();
}

/** Forgot-password step 3: set the new password with the reset token from step 2, then log straight in. */
const NewPasswordFormProvider = ({ children }: IProps) => {
  const methods = useForm<TNewPasswordFormSchema>({
    resolver: zodResolver(newPasswordFormSchema()),
    mode: "onChange",
    defaultValues: {
      password: "",
      repeatPassword: ""
    }
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  /** Server message of a 401 on reset-password (token expired/used, or account blocked meanwhile). */
  const [tokenError, setTokenError] = useState<string | null>(null);
  const router = useRouter();
  const resetToken = useResetPasswordStore((s) => s.resetToken);
  const expiresAt = useResetPasswordStore((s) => s.expiresAt);
  const clearReset = useResetPasswordStore((s) => s.clear);
  const { mutateAsync, isPending } = useResetPassword();
  const setToken = useTokenStore((s) => s.setToken);
  const clearSalon = useSalonContextStore((s) => s.clearAll);

  // No token (page refreshed / opened directly) or it expired / was rejected:
  // the only way forward is a fresh code.
  if (!resetToken || tokenError !== null || isExpired(expiresAt)) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <p className="px-4 text-sm text-foreground-muted">
          {tokenError ||
            (resetToken
              ? "مهلت تغییر رمز عبور تمام شده است. لطفاً دوباره کد تایید دریافت کنید."
              : "برای تغییر رمز عبور ابتدا کد تایید را وارد کنید.")}
        </p>
        <Link
          href={RouteAddress.AUTH.RESET_PASSWORD.BASE}
          onClick={clearReset}
          className="w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
        >
          دریافت کد تایید
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: TNewPasswordFormSchema) => {
    if (data.password !== data.repeatPassword) {
      setError("repeatPassword", {
        type: "manual",
        message: "رمز عبور با تکرار آن مطابقت ندارد",
      });
      return;
    }
    setGeneralError("");
    try {
      const res = await mutateAsync({ resetToken, newPassword: data.password });
      clearReset();
      clearSalon();
      setToken(res.data, true);
      router.replace(resolvePostLoginRedirect());
    } catch (e) {
      // 401 = reset token invalid/expired/used or account blocked → show the server's
      // message and restart with a fresh code.
      const response = (e as { response?: { status?: number; data?: { message?: string } } })
        ?.response;
      if (response?.status === 401) {
        setTokenError(response.data?.message ?? "");
        return;
      }
      handleFormError(setError, setGeneralError, { newpassword: "password" })(e);
    }
  };

  return (
    <FormLoadingProvider isLoading={isPending}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {generalError && (
            <p className="px-4 text-xs font-medium text-error">{generalError}</p>
          )}
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default NewPasswordFormProvider;
