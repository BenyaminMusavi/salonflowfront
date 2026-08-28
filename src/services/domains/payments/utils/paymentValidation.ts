import { z } from "zod";

// Mirrors backend's RecordPaymentRequest validation (BACKEND_UPDATE_REPORT.md §2.4).
const recordPaymentSchema = z.object({
  invoiceId: z.number().int().positive("فاکتور را انتخاب کنید"),
  amount: z.number().positive("مبلغ پرداخت باید بزرگ‌تر از صفر باشد"),
  paymentMethod: z.number().int().min(1).max(5, "روش پرداخت نامعتبر است"),
  paymentType: z.number().int().min(1).max(5, "نوع پرداخت نامعتبر است"),
});

export type TPaymentFieldErrors = {
  invoiceId?: string;
  amount?: string;
};

export function validateRecordPayment(input: {
  invoiceId: number;
  amount: number;
  paymentMethod: number;
  paymentType: number;
}): TPaymentFieldErrors | null {
  const result = recordPaymentSchema.safeParse(input);
  if (result.success) return null;

  const fieldErrors: TPaymentFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "invoiceId") fieldErrors.invoiceId = issue.message;
    else if (field === "amount") fieldErrors.amount = issue.message;
  }
  return fieldErrors;
}
