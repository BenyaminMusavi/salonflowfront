"use client";

import { ReactNode, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  otpFormSchema,
  TOtpFormSchema,
} from "./otpFormSchema";
import { useMutateVerifyOtp } from "@/services/domains/auth/hooks/useMutateVerifyOtp";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { resolvePostLoginRedirect } from "@/shared/utils/authRedirect";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const OtpFormProvider = ({ children }: IProps) => {
  const methods = useForm<TOtpFormSchema>({
    resolver: zodResolver(otpFormSchema()),
    mode: "onChange",
    defaultValues: {
      otp: "",
      acceptedTerms: false,
    }
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const { mutateAsync, isPending } = useMutateVerifyOtp();
  const setToken = useTokenStore((s) => s.setToken);
  const clearSalon = useSalonContextStore((s) => s.clearAll);

  const onSubmit = async (data: TOtpFormSchema) => {
    if (!phone) {
      setGeneralError("شماره موبایل یافت نشد");
      return;
    }
    setGeneralError("");
    try {
      const res = await mutateAsync({
        phone,
        code: data.otp,
        acceptedTerms: data.acceptedTerms,
      });
      clearSalon();
      setToken(res.data, true);
      router.push(resolvePostLoginRedirect());
    } catch (e) {
      handleFormError(setError, setGeneralError, {
        acceptedterms: "acceptedTerms",
      })(e);
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

export default OtpFormProvider;
