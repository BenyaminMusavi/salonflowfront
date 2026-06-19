"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  TLoginFormSchema,
} from "./loginFormSchema";
import { useLoginWithPassword } from "@/services/domains/auth/hooks/useMutateLoginWithPassword";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { RouteAddress } from "@/shared/data/routeAddress";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const LoginFormProvider = ({ children }: IProps) => {
  const methods = useForm<TLoginFormSchema>({
    resolver: zodResolver(loginFormSchema()),
    defaultValues: {
      phone: "",
      password: ""
    },
    mode: "onChange",
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const { mutateAsync, isPending } = useLoginWithPassword();
  const setAccessToken = useTokenStore((s) => s.setAccessToken);

  const onSubmit = async (data: TLoginFormSchema) => {
    setGeneralError("");
    try {
      const res = await mutateAsync({
        phone: data.phone,
        password: data.password,
      });
      setAccessToken(res.data.accessToken);
      router.push(RouteAddress.HOME.BASE);
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

export default LoginFormProvider;
