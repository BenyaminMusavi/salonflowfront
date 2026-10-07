"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneStartFormSchema, TPhoneStartFormSchema } from "./phoneStartFormSchema";
import { useMutateSendOtp } from "@/services/domains/auth/hooks/useMutateSendOtp";
import { useAuthPhoneStore } from "@/services/authentication-store/useAuthPhoneStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * «ورود یا ثبت‌نام» — one door for everyone: send an SMS code to the phone. verify-otp logs an
 * existing account in and creates a new one, so the user never has to know which they are.
 */
const PhoneStartFormProvider = ({ children }: { children: ReactNode }) => {
  const savedPhone = useAuthPhoneStore((s) => s.phone);
  const setPhone = useAuthPhoneStore((s) => s.setPhone);
  const methods = useForm<TPhoneStartFormSchema>({
    resolver: zodResolver(phoneStartFormSchema()),
    mode: "onChange",
    defaultValues: { phone: savedPhone },
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const { mutateAsync, isPending } = useMutateSendOtp();

  const onSubmit = async (data: TPhoneStartFormSchema) => {
    setGeneralError("");
    setPhone(data.phone);
    try {
      await mutateAsync({ phone: data.phone });
      router.push(`${RouteAddress.AUTH.OTP.BASE}?phone=${encodeURIComponent(data.phone)}`);
    } catch (e) {
      handleFormError(setError, setGeneralError)(e);
    }
  };

  return (
    <FormLoadingProvider isLoading={isPending}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {generalError && <p className="px-4 text-xs font-medium text-error">{generalError}</p>}
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default PhoneStartFormProvider;
