"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerFormSchema,
  TRegisterFormSchema,
} from "./registerFormSchema";
import { useMutateSendOtp } from "@/services/domains/auth/hooks/useMutateSendOtp";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const RegisterFormProvider = ({ children }: IProps) => {
  const methods = useForm<TRegisterFormSchema>({
    resolver: zodResolver(registerFormSchema()),
    mode: "onChange",
    defaultValues: {
      phone: "",
      referralCode: ""
    }
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const { mutateAsync, isPending } = useMutateSendOtp();

  const onSubmit = async (data: TRegisterFormSchema) => {
    setGeneralError("");
    try {
      await mutateAsync({ phone: data.phone });
      router.push(`/auth/otp?phone=${encodeURIComponent(data.phone)}`);
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

export default RegisterFormProvider;
