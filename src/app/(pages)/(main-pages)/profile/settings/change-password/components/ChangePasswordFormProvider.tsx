"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordFormSchema,
  TChangePasswordFormSchema,
} from "./changePasswordFormSchema";
import { useSetPassword } from "@/services/domains/auth/hooks/useMutateSetPassword";
import { useMutateLoginWithPassword } from "@/services/domains/auth/hooks/useMutateLoginWithPassword";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

// Backend never distinguishes "wrong old password" from other 401s in the message text
// (BACKEND_UPDATE_REPORT.md §1.1) — this screen supplies its own, attached to the field.
const WRONG_OLD_PASSWORD_MESSAGE = "رمز عبور فعلی وارد شده صحیح نیست.";
// 5 wrong current-password attempts lock password change for 30 minutes (429).
const LOCKED_MESSAGE =
  "به دلیل چند بار اشتباه در رمز فعلی، تغییر رمز تا 30 دقیقه قفل شد. می‌توانید رمز را با کد پیامکی بازیابی کنید.";

const ChangePasswordFormProvider = ({ children }: IProps) => {
  const hasPassword = useTokenStore((s) => s.token?.hasPassword ?? true);
  const setToken = useTokenStore((s) => s.setToken);
  const clearToken = useTokenStore((s) => s.clear);
  const clearSalon = useSalonContextStore((s) => s.clearAll);
  const router = useRouter();
  const { data: meData } = useQueryAuthMe();
  const methods = useForm<TChangePasswordFormSchema>({
    resolver: zodResolver(changePasswordFormSchema(hasPassword)),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      password: "",
      repeatPassword: "",
    },
  });

  const { setError, handleSubmit, reset } = methods;
  const [generalError, setGeneralError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending } = useSetPassword();
  const login = useMutateLoginWithPassword();

  /** Changing an existing password signs out every session, this one included — log straight back in with the new one. */
  const reLogin = async (password: string) => {
    const phone = meData?.data?.phone;
    try {
      if (!phone) throw new Error("missing phone");
      const res = await login.mutateAsync({ phone, password });
      setToken(res.data, true);
    } catch {
      clearSalon();
      clearToken();
      router.replace(getLoginHref(RouteAddress.PROFILE.SETTINGS));
      return false;
    }
    return true;
  };

  const onSubmit = async (data: TChangePasswordFormSchema) => {
    setGeneralError("");
    setIsLocked(false);
    setSuccess(false);
    try {
      await mutateAsync({
        oldPassword: data.oldPassword,
        password: data.password,
      });
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError("oldPassword", {
          type: "manual",
          message: WRONG_OLD_PASSWORD_MESSAGE,
        });
        return;
      }
      if (status === 429 && hasPassword) {
        setIsLocked(true);
        return;
      }
      handleFormError(setError, setGeneralError)(e);
      return;
    }

    // First-time setup (after OTP) keeps the session; only a real change revokes it.
    if (hasPassword && !(await reLogin(data.password))) return;
    setSuccess(true);
    reset();
  };

  return (
    <FormLoadingProvider isLoading={isPending || login.isPending}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {generalError && (
            <p className="px-4 text-xs font-medium text-error">{generalError}</p>
          )}
          {isLocked && (
            <div className="mx-4 flex flex-col gap-2 rounded-2xl bg-surface p-3">
              <p className="text-xs font-medium text-error">{LOCKED_MESSAGE}</p>
              <Link
                href={RouteAddress.AUTH.RESET_PASSWORD.BASE}
                className="text-xs font-bold text-primary"
              >
                بازیابی رمز با کد پیامکی
              </Link>
            </div>
          )}
          {success && (
            <p className="px-4 text-xs font-medium text-success">
              رمز عبور شما با موفقیت تغییر کرد.
            </p>
          )}
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default ChangePasswordFormProvider;
