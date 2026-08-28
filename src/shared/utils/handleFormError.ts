import { FieldValues, UseFormSetError } from "react-hook-form";
import {
  TApiErrorResponse,
  TErrorTypeEnum,
} from "@/services/common/data-types/SharedDataTypes";

const DEFAULT_ERROR_MESSAGE = "خطایی رخ داده است";
const RATE_LIMIT_FALLBACK_MESSAGE =
  "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید و دوباره تلاش کنید.";

/**
 * @param fieldMap Backend field names always arrive lowercased (e.g. "acceptedterms",
 * "oldpassword" — see BACKEND_UPDATE_REPORT.md §2.4). Pass a lowercase-backend-name ->
 * actual-RHF-field-name entry here for any field whose form name isn't already lowercase,
 * otherwise `setError` silently attaches to a field nothing renders.
 */
export const handleFormError =
  <TFieldValues extends FieldValues>(
    setError: UseFormSetError<TFieldValues>,
    setGeneralError: (error: string) => void,
    fieldMap: Record<string, string> = {},
  ) =>
  (e: unknown) => {
    const response = (e as { response?: { status?: number; data?: TApiErrorResponse } })
      ?.response;
    const data = response?.data;

    if (data?.type === TErrorTypeEnum.validation_error && Array.isArray(data.errors)) {
      data.errors.forEach(({ field, message }) => {
        const fieldName = fieldMap[field] ?? field;
        setError(fieldName as any, { type: "manual", message });
      });
      return;
    }

    if (response?.status === 429) {
      const message =
        data?.type === TErrorTypeEnum.rate_limit_exceeded && data.message
          ? data.message
          : RATE_LIMIT_FALLBACK_MESSAGE;
      setGeneralError(message);
      return;
    }

    setGeneralError(data?.message || DEFAULT_ERROR_MESSAGE);
  };
