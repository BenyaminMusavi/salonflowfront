"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordFormSchema,
  TResetPasswordFormSchema,
} from "./resetPasswordFormSchema";
import { useMutateForgetPassword } from "@/services/domains/auth/hooks/useMutateForgetPassword";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { RouteAddress } from "@/shared/data/routeAddress";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const ResetPasswordFormProvider = ({ children }: IProps) => {
  const methods = useForm<TResetPasswordFormSchema>({
    resolver: zodResolver(resetPasswordFormSchema()),
    mode: "onChange",
    defaultValues: {
      phone: ""
    }
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const { mutateAsync, isPending } = useMutateForgetPassword();

  const onSubmit = async (data: TResetPasswordFormSchema) => {
    setGeneralError("");
    try {
      await mutateAsync({ phone: data.phone });
      router.push(
        `${RouteAddress.AUTH.OTP.BASE}?phone=${encodeURIComponent(data.phone)}`
      );
    } catch (e) {
      handleFormError(setError, setGeneralError)(e);
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

export default ResetPasswordFormProvider;
