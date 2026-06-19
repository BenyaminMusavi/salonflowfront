import { FieldValues, UseFormSetError } from "react-hook-form";

export const handleValidationErrors =
  <TFieldValues extends FieldValues>(setError: UseFormSetError<TFieldValues>) =>
  (e: any) => {
    if (e && e?.data?.type === "validation_error") {
      const validationErrors = e.data.errors;
      Object.keys(validationErrors).forEach((fieldName) => {
        setError(fieldName as any, {
          type: "manual",
          message: validationErrors[fieldName],
        });
      });
    } else {
      // Handle other error types or log the error
      console.error("Unexpected error:", e);
    }
  };
