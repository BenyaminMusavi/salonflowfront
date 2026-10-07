"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { setPasswordFormSchema, TSetPasswordFormSchema } from "./setPasswordFormSchema";
import { useSetPassword } from "@/services/domains/auth/hooks/useMutateSetPassword";
import { useUpdateProfile } from "@/services/domains/auth/hooks/useMutateUpdateProfile";
import { AUTH_QUERY_KEY, useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { resolvePostLoginRedirect } from "@/shared/utils/authRedirect";
import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * «تکمیل حساب» right after the SMS code: the name once (only while it is missing) and an
 * optional password. Name only → PATCH profile; with a password → set-password (+ name).
 */
const SetPasswordFormProvider = ({ children }: { children: ReactNode }) => {
  const methods = useForm<TSetPasswordFormSchema>({
    resolver: zodResolver(setPasswordFormSchema()),
    mode: "onChange",
    defaultValues: {
      askName: true,
      withPassword: false,
      firstName: "",
      lastName: "",
      password: "",
      repeatPassword: "",
    },
  });

  const { setError, handleSubmit, setValue } = methods;
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const me = useQueryAuthMe().data?.data;
  const setPassword = useSetPassword();
  const updateProfile = useUpdateProfile();

  // Only reachable right after the SMS code — anyone else goes to «ورود یا ثبت‌نام».
  useEffect(() => {
    if (!isLoggedIn) router.replace(RouteAddress.AUTH.LOGIN.BASE);
  }, [isLoggedIn, router]);

  // A name entered once is never asked again; keep any half the account already has.
  useEffect(() => {
    if (!me) return;
    const first = me.firstName?.trim() ?? "";
    const last = me.lastName?.trim() ?? "";
    setValue("askName", !first || !last);
    if (first) setValue("firstName", first);
    if (last) setValue("lastName", last);
  }, [me, setValue]);

  const onSubmit = async (data: TSetPasswordFormSchema) => {
    setGeneralError("");
    const names = data.askName
      ? { firstName: data.firstName.trim(), lastName: data.lastName.trim() }
      : {};
    try {
      if (data.withPassword) {
        await setPassword.mutateAsync({ password: data.password, ...names });
        // «امنیت و رمز عبور» reads hasPassword from the stored token to ask for the current one.
        const token = useTokenStore.getState().token;
        if (token) useTokenStore.getState().setToken({ ...token, hasPassword: true }, true);
      } else if (data.askName) {
        await updateProfile.mutateAsync({ firstName: names.firstName!, lastName: names.lastName! });
      }
      // The header / profile read the name from /api/auth/me.
      await queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
      router.push(resolvePostLoginRedirect());
    } catch (e) {
      handleFormError(setError, setGeneralError)(e);
    }
  };

  return (
    <FormLoadingProvider isLoading={setPassword.isPending || updateProfile.isPending}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {generalError && <p className="px-4 text-xs font-medium text-error">{generalError}</p>}
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default SetPasswordFormProvider;
