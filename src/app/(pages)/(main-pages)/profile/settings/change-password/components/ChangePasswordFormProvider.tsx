"use client";

import { ReactNode, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordFormSchema,
  TChangePasswordFormSchema,
} from "./changePasswordFormSchema";
import { useSetPassword } from "@/services/domains/auth/hooks/useMutateSetPassword";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";

// ---------- PROVIDER ----------
interface IProps {
  children: ReactNode;
}

// Backend never distinguishes "wrong old password" from other 401s in the message text
// (BACKEND_UPDATE_REPORT.md §1.1) — this screen supplies its own, attached to the field.
const WRONG_OLD_PASSWORD_MESSAGE = "رمز عبور فعلی وارد شده صحیح نیست.";

const ChangePasswordFormProvider = ({ children }: IProps) => {
  const methods = useForm<TChangePasswordFormSchema>({
    resolver: zodResolver(changePasswordFormSchema()),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      password: "",
      repeatPassword: "",
    },
  });

  const { setError, handleSubmit, reset } = methods;
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending } = useSetPassword();

  const onSubmit = async (data: TChangePasswordFormSchema) => {
    setGeneralError("");
    setSuccess(false);
    try {
      await mutateAsync({
        oldPassword: data.oldPassword,
        password: data.password,
      });
      setSuccess(true);
      reset();
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError("oldPassword", {
          type: "manual",
          message: WRONG_OLD_PASSWORD_MESSAGE,
        });
        return;
      }
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
          {success && (
            <p className="px-4 text-xs font-medium text-success">
              رمز عبور شما با موفقیت تغییر کرد.
            </p>
          )}
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default ChangePasswordFormProvider;
