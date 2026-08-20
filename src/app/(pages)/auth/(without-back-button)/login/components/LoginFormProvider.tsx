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
  const clearSalon = useSalonContextStore((s) => s.clearAll);

  const onSubmit = async (data: TLoginFormSchema) => {
    clearError();
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
