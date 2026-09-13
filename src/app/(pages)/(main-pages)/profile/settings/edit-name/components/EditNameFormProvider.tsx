"use client";

import { ReactNode, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  editNameFormSchema,
  TEditNameFormSchema,
} from "./editNameFormSchema";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import {
  AUTH_QUERY_KEY,
  useQueryAuthMe,
} from "@/services/domains/auth/hooks/useQueryAuthMe";
import { TAuthMeEntity } from "@/services/domains/auth/types/auth.type";

interface IProps {
  children: ReactNode;
}

// TODO(Sync Backend): /api/auth/set-password is the only endpoint that currently accepts
// firstName/lastName, but it also requires `password` (and `oldPassword` when one is
// already set) — forcing a password re-entry just to rename is bad UX. This form is wired
// to a local mock (optimistic cache update only, no network call) until a dedicated
// name-only endpoint (e.g. PATCH /api/auth/profile) exists on the backend. Once that lands,
// swap the mocked onSubmit below for a real mutation the same way ChangePasswordFormProvider
// calls useSetPassword.
const EditNameFormProvider = ({ children }: IProps) => {
  const queryClient = useQueryClient();
  const { data } = useQueryAuthMe();
  const me = data?.data;

  const methods = useForm<TEditNameFormSchema>({
    resolver: zodResolver(editNameFormSchema),
    mode: "onChange",
    values: {
      firstName: me?.firstName ?? "",
      lastName: me?.lastName ?? "",
    },
  });

  const { setError, handleSubmit } = methods;
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (formData: TEditNameFormSchema) => {
    setGeneralError("");
    setSuccess(false);
    setIsPending(true);
    try {
      // Mock network round-trip; replace with the real mutation once the backend
      // endpoint is ready (see TODO above).
      await new Promise((resolve) => setTimeout(resolve, 500));

      queryClient.setQueryData<TAuthMeEntity>([AUTH_QUERY_KEY], (prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                firstName: formData.firstName,
                lastName: formData.lastName,
              },
            }
          : prev
      );
      setSuccess(true);
    } catch (e) {
      handleFormError(setError, setGeneralError)(e);
    } finally {
      setIsPending(false);
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
              نام شما با موفقیت به‌روزرسانی شد.
            </p>
          )}
          {children}
        </form>
      </FormProvider>
    </FormLoadingProvider>
  );
};

export default EditNameFormProvider;
