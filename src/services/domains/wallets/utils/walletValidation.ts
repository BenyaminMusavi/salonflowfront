import { z } from "zod";

// Mirrors backend's WalletOperationRequest validation (BACKEND_UPDATE_REPORT.md §2.4).
const walletOperationSchema = z.object({
  customerId: z.number().int().positive("مشتری را انتخاب کنید"),
  amount: z.number().positive("مبلغ باید بزرگ‌تر از صفر باشد"),
});

export type TWalletFieldErrors = {
  customerId?: string;
  amount?: string;
};

export function validateWalletOperation(input: {
  customerId: number;
  amount: number;
}): TWalletFieldErrors | null {
  const result = walletOperationSchema.safeParse(input);
  if (result.success) return null;

  const fieldErrors: TWalletFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "customerId") fieldErrors.customerId = issue.message;
    else if (field === "amount") fieldErrors.amount = issue.message;
  }
  return fieldErrors;
}
