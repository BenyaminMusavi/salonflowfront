"use client";

import { ReactNode, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newPasswordFormSchema,
  TNewPasswordFormSchema,
} from "./newPasswordFormSchema";
import { useSetPasswordWithOtp } from "@/services/domains/auth/hooks/useMutateSetPasswordWithOtp";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { resolvePostLoginRedirect } from "@/shared/utils/authRedirect";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const NewPasswordFormProvider = ({ children }: IProps) => {
  const methods = useForm<TNewPasswordFormSchema>({
    resolver: zodResolver(newPasswordFormSchema()),
    mode: "onChange",
    defaultValues: {
      otp: "",
      password: "",
      repeatPassword: ""
    }
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const { mutateAsync, isPending } = useSetPasswordWithOtp();
  const setToken = useTokenStore((s) => s.setToken);
  const clearSalon = useSalonContextStore((s) => s.clearAll);

  const onSubmit = async (data: TNewPasswordFormSchema) => {
    if (!phone) {
      setGeneralError("شماره موبایل یافت نشد");
      return;
    }
    if (data.password !== data.repeatPassword) {
      setError("repeatPassword", {
        type: "manual",
        message: "رمز عبور با تکرار آن مطابقت ندارد",
      });
      return;
    }
    setGeneralError("");
    try {
      const res = await mutateAsync({
        phone,
        code: data.otp,
        password: data.password,
      });
      clearSalon();
      setToken(res.data, true);
      router.push(resolvePostLoginRedirect());
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

export default NewPasswordFormProvider;
