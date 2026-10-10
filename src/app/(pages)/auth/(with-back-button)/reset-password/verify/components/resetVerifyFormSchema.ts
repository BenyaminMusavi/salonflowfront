import { z } from "zod";

export const resetVerifyFormSchema = () =>
  z.object({
    otp: z
      .string({ message: "لطفاً کد تأیید را وارد کنید" })
      .min(1, "لطفاً کد تأیید را وارد کنید"),
  });

export type TResetVerifyFormSchema = z.infer<
  ReturnType<typeof resetVerifyFormSchema>
>;
