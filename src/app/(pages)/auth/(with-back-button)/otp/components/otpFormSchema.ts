import { z } from "zod";

export const otpFormSchema = () =>
  z.object({
    otp: z
      .string({ message: "لطفا کد یکبار مصرف دریافتی را وارد نمایید" })
      .min(1, "لطفا کد یکبار مصرف دریافتی را وارد نمایید"),
    /**
     * Only matters if this verification creates a brand-new account — ignored by the
     * backend for a returning user. Always shown/required client-side since the frontend
     * can't know in advance which case applies (see BACKEND_UPDATE_REPORT.md §1.2).
     */
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: "برای ادامه باید قوانین و مقررات و حریم خصوصی را بپذیرید",
    }),
  });

export type TOtpFormSchema = z.infer<
  ReturnType<typeof otpFormSchema>
>;
