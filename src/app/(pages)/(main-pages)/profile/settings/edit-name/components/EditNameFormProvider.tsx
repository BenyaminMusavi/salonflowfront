"use client";

import { ReactNode, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editNameFormSchema,
  TEditNameFormSchema,
} from "./editNameFormSchema";
import { handleFormError } from "@/shared/utils/handleFormError";
import { FormLoadingProvider } from "@/shared/contexts/FormLoadingContext";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useUpdateProfile } from "@/services/domains/auth/hooks/useMutateUpdateProfile";

interface IProps {
  children: ReactNode;
}

const EditNameFormProvider = ({ children }: IProps) => {
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
  const { mutateAsync, isPending } = useUpdateProfile();

  const onSubmit = async (formData: TEditNameFormSchema) => {
    setGeneralError("");
    setSuccess(false);
    try {
      await mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setSuccess(true);
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
