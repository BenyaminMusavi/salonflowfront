"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  setPasswordFormSchema,
  TSetPasswordFormSchema,
} from "./setPasswordFormSchema";
import { useSetPassword } from "@/services/domains/auth/hooks/useMutateSetPassword";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { resolvePostLoginRedirect } from "@/shared/utils/authRedirect";
import { RouteAddress } from "@/shared/data/routeAddress";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

const SetPasswordFormProvider = ({ children }: IProps) => {
  const methods = useForm<TSetPasswordFormSchema>({
    resolver: zodResolver(setPasswordFormSchema()),
    mode: "onChange",
    defaultValues: {
      password: "",
      repeatPassword: "",
    },
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { mutateAsync, isPending } = useSetPassword();

  // This screen only makes sense right after OTP verification — bounce anyone
  // arriving without a session back to registration instead of showing a form
  // that will just fail.
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(RouteAddress.AUTH.REGISTER.BASE);
    }
  }, [isLoggedIn, router]);

  const onSubmit = async (data: TSetPasswordFormSchema) => {
    setGeneralError("");
    try {
      await mutateAsync({ password: data.password });
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

export default SetPasswordFormProvider;
