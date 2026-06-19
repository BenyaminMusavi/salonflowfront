"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, TLoginFormSchema } from "./loginFormSchema";
import { useMutateLoginWithPassword } from "@/services/domains/auth/hooks/useMutateLoginWithPassword";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { RouteAddress } from "@/shared/data/routeAddress";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { useFormError } from "@/shared/hooks/useFormError";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const LoginFormProvider = ({ children }: IProps) => {
  const methods = useForm<TLoginFormSchema>({
    resolver: zodResolver(loginFormSchema()),
    defaultValues: {
      phone: "",
      password: "",
    },
    mode: "onChange",
  });

  const { setError, handleSubmit } = methods;
  const {setGeneralError, clearError} = useFormError()
  const router = useRouter();
  const { mutateAsync, isPending } = useMutateLoginWithPassword();
  const setAccessToken = useTokenStore((s) => s.setToken);
  const setIsLoggedIn = useTokenStore((s) => s.setIsLoggedIn);

  const onSubmit = async (data: TLoginFormSchema) => {
    clearError();
    try {
      const res = await mutateAsync({
        phone: data.phone,
        password: data.password,
      });
      setAccessToken({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      setIsLoggedIn(true);
      router.push(RouteAddress.HOME.BASE);
    } catch (e) {
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
