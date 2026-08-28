import { z } from "zod";

const PHONE_RULE = /^09\d{9}$/;

const staffRowSchema = z
  .object({
    clientKey: z.string(),
    isCreator: z.boolean(),
    branchPublicId: z.string().min(1, "شعبه را انتخاب کنید"),
    phoneNumber: z.string(),
    offeringPublicIds: z.array(z.string()).min(1, "حداقل یک خدمت انتخاب کنید"),
  })
  .superRefine((row, ctx) => {
    // The owner's own row is identity-linked via the JWT, not a phone field the
    // owner fills in here — only non-creator rows need a valid phone.
    if (!row.isCreator && !PHONE_RULE.test(row.phoneNumber.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "شماره موبایل معتبر نیست (مثال: 09123456789)",
      });
    }
  });

export type TStaffRosterFieldErrors = {
  phoneNumber?: string;
  branchPublicId?: string;
  offeringPublicIds?: string;
};

export function validateStaffRoster(
  rows: Array<{
    clientKey: string;
    isCreator: boolean;
    branchPublicId: string;
    phoneNumber: string;
    offeringPublicIds: string[];
  }>
): Record<string, TStaffRosterFieldErrors> | null {
  const errorsByRow: Record<string, TStaffRosterFieldErrors> = {};

  rows.forEach((row) => {
    const result = staffRowSchema.safeParse(row);
    if (result.success) return;

    const rowErrors: TStaffRosterFieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "phoneNumber") rowErrors.phoneNumber = issue.message;
      else if (field === "branchPublicId") rowErrors.branchPublicId = issue.message;
      else if (field === "offeringPublicIds") rowErrors.offeringPublicIds = issue.message;
    }
    if (Object.keys(rowErrors).length > 0) errorsByRow[row.clientKey] = rowErrors;
  });

  return Object.keys(errorsByRow).length > 0 ? errorsByRow : null;
}
