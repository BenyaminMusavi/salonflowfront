import { z } from "zod";

export const otpFormSchema = () =>
  z.object({
    otp: z
      .string({ message: "لطفا کد یکبار مصرف دریافتی را وارد نمایید" })
      .min(1, "لطفا کد یکبار مصرف دریافتی را وارد نمایید"),
  });

export type TOtpFormSchema = z.infer<
  ReturnType<typeof otpFormSchema>
>;
