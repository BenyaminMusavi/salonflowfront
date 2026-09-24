"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetVerifyFormSchema,
  TResetVerifyFormSchema,
} from "./resetVerifyFormSchema";
import { useMutateVerifyResetCode } from "@/services/domains/auth/hooks/useMutateVerifyResetCode";
import { useResetPasswordStore } from "@/services/authentication-store/useResetPasswordStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { RouteAddress } from "@/shared/data/routeAddress";

interface IProps {
  children: ReactNode;
}

/** Forgot-password step 2: verify the OTP only, keep the reset token in memory, then go set the new password. */
const ResetVerifyFormProvider = ({ children }: IProps) => {
  const methods = useForm<TResetVerifyFormSchema>({
    resolver: zodResolver(resetVerifyFormSchema()),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const phone = useResetPasswordStore((s) => s.phone);
  const setResetToken = useResetPasswordStore((s) => s.setResetToken);
  const clearReset = useResetPasswordStore((s) => s.clear);
  const { mutateAsync, isPending } = useMutateVerifyResetCode();

  // Phone lives only in memory: a refresh / direct visit restarts from the phone step.
  if (!phone) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <p className="px-4 text-sm text-foreground-muted">
          برای بازیابی رمز عبور ابتدا شماره موبایل خود را وارد کنید.
        </p>
        <Link
          href={RouteAddress.AUTH.RESET_PASSWORD.BASE}
          onClick={clearReset}
          className="w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
        >
          وارد کردن شماره موبایل
        </Link>
      </div>
    );
  }

  // Only the OTP field is rendered here; any other field error (e.g. phone) goes to the general error.
  const setFieldError: UseFormSetError<TResetVerifyFormSchema> = (name, error, options) => {
    if (name === "otp") setError(name, error, options);
    else setGeneralError(error.message ?? "");
  };

  const onSubmit = async (data: TResetVerifyFormSchema) => {
    setGeneralError("");
    try {
      const res = await mutateAsync({ phone, code: data.otp });
      setResetToken(res.data.resetToken, res.data.expiresAt);
      router.replace(RouteAddress.AUTH.RESET_PASSWORD.NEW_PASSWORD);
    } catch (e) {
      handleFormError(setFieldError, setGeneralError, { code: "otp" })(e);
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

export default ResetVerifyFormProvider;
