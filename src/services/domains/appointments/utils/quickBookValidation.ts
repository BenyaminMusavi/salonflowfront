import { z } from "zod";

// Mirrors backend's QuickBookRequest validation (BACKEND_UPDATE_REPORT.md §2.4).
const PHONE_RULE = /^09\d{9}$/;

const quickBookSchema = z.object({
  phone: z
    .string({ message: "شماره موبایل مشتری را وارد کنید" })
    .regex(PHONE_RULE, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
  branchId: z
    .number({ message: "شعبه را انتخاب کنید" })
    .int()
    .positive("شعبه را انتخاب کنید"),
  startTime: z.string().min(1, "تاریخ و ساعت را انتخاب کنید"),
  services: z
    .array(
      z.object({
        offeringId: z.number().int().positive("سرویس را انتخاب کنید"),
        staffId: z.number().int().positive("پرسنل را انتخاب کنید"),
      })
    )
    .min(1, "سرویس و پرسنل را انتخاب کنید"),
});

export type TQuickBookFieldErrors = {
  phone?: string;
  branchId?: string;
  offeringId?: string;
  staffId?: string;
  startTime?: string;
};

export function validateQuickBook(input: {
  phone: string;
  branchId: number;
  offeringId: number;
  staffId: number;
  startTime: string;
}): TQuickBookFieldErrors | null {
  const result = quickBookSchema.safeParse({
    phone: input.phone,
    branchId: input.branchId,
    startTime: input.startTime,
    services: [{ offeringId: input.offeringId, staffId: input.staffId }],
  });
  if (result.success) return null;

  const fieldErrors: TQuickBookFieldErrors = {};
  for (const issue of result.error.issues) {
    const [root, , key] = issue.path;
    if (root === "phone") fieldErrors.phone = issue.message;
    else if (root === "branchId") fieldErrors.branchId = issue.message;
    else if (root === "startTime") fieldErrors.startTime = issue.message;
    else if (root === "services") {
      if (key === "offeringId") fieldErrors.offeringId = issue.message;
      else if (key === "staffId") fieldErrors.staffId = issue.message;
      // top-level "pick at least one service" error - surface on the offering field
      else fieldErrors.offeringId = issue.message;
    }
  }
  return fieldErrors;
}
