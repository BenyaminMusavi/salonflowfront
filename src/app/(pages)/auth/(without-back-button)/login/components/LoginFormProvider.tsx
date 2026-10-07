"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, TLoginFormSchema } from "./loginFormSchema";
import { useMutateLoginWithPassword } from "@/services/domains/auth/hooks/useMutateLoginWithPassword";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { useFormError } from "@/shared/hooks/useFormError";
import { resolvePostLoginRedirect } from "@/shared/utils/authRedirect";
import { useAuthPhoneStore } from "@/services/authentication-store/useAuthPhoneStore";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const LoginFormProvider = ({ children }: IProps) => {
  const savedPhone = useAuthPhoneStore((s) => s.phone);
  const setPhone = useAuthPhoneStore((s) => s.setPhone);
  const methods = useForm<TLoginFormSchema>({
    resolver: zodResolver(loginFormSchema()),
    defaultValues: {
      phone: savedPhone,
      password: "",
    },
    mode: "onChange",
  });

  const { setError, handleSubmit } = methods;
  const {setGeneralError, clearError} = useFormError()
  const router = useRouter();
  const { mutateAsync, isPending } = useMutateLoginWithPassword();
  const setAccessToken = useTokenStore((s) => s.setToken);
  const clearSalon = useSalonContextStore((s) => s.clearAll);

  const onSubmit = async (data: TLoginFormSchema) => {
    clearError();
    setPhone(data.phone);
    try {
      const res = await mutateAsync({
        phone: data.phone,
        password: data.password,
      });
      clearSalon();
      setAccessToken(res.data, true);
      // Login JWT is always customer/global; memberships hydrate via GET /api/auth/me.
      router.push(resolvePostLoginRedirect());
    } catch (e) {
      // The backend never says whether a phone has an account (no enumeration), so a 401 is
      // worded for both cases; LoginForm then offers the SMS code for this phone.
      if ((e as { response?: { status?: number } })?.response?.status === 401) {
        setGeneralError("رمز عبور درست نیست، یا هنوز با این شماره ثبت‌نام نکرده‌اید.");
        return;
      }
      handleFormError(setError, setGeneralError)(e);
    }
  };

  return (
    <FormLoadingProvider isLoading={isPending}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default LoginFormProvider;
