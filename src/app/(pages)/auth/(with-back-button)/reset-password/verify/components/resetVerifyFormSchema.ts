import { z } from "zod";

export const resetVerifyFormSchema = () =>
  z.object({
    otp: z
      .string({ message: "لطفا کد یکبار مصرف دریافتی را وارد نمایید" })
      .min(1, "لطفا کد یکبار مصرف دریافتی را وارد نمایید"),
  });

export type TResetVerifyFormSchema = z.infer<
  ReturnType<typeof resetVerifyFormSchema>
>;
