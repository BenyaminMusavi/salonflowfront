import { FieldValues, UseFormSetError } from "react-hook-form";
import { TErrorTypeEnum } from "@/services/common/data-types/SharedDataTypes";

const convertErrorKeyToFormField = (key: string): string => {
  const prefixes = ["ownerInfo", "representativeInfo"];
  for (const prefix of prefixes) {
    if (key.startsWith(prefix) && key.length > prefix.length) {
      const rest = key.slice(prefix.length);
      return `${prefix}.${rest.charAt(0).toLowerCase() + rest.slice(1)}`;
    }
  }
  return key;
};

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
        const formFieldName = convertErrorKeyToFormField(fieldName);
        setError(formFieldName as any, {
          type: "manual",
          message: errorMessage,
        });
      });
    } else {
      setGeneralError(e?.response?.data?.message ?? "خطایی رخ داده است");
    }
  };
