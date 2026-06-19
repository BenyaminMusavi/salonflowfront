import { FieldValues, UseFormSetError } from "react-hook-form";
import { TErrorTypeEnum } from "@/services/common/data-types/SharedDataTypes";

export const handleFormError =
  <TFieldValues extends FieldValues>(
    setError: UseFormSetError<TFieldValues>,
    setGeneralError: (error: string) => void,
  ) =>
  (e: any) => {
    if (e?.response?.data?.type === TErrorTypeEnum.validation_error) {
      const validationErrors = e.response.data.errors;
      Object.keys(validationErrors).forEach((fieldName) => {
        const errorValue = validationErrors[fieldName];
        const errorMessage = Array.isArray(errorValue)
          ? errorValue.join(" - ")
          : errorValue;
        setError(fieldName as any, {
          type: "manual",
          message: errorMessage,
        });
      });
    } else {
      setGeneralError(e?.response?.data?.message ?? "خطایی رخ داده است");
    }
  };
