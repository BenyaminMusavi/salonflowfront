import { z } from "zod";

export const newPasswordFormSchema = () =>
  z.object({
    password: z
      .string({
        message: "لطفا رمز عبور را وارد نمایید",
      })
      .min(1, "لطفا رمز عبور را وارد نمایید"),
    repeatPassword: z
      .string({
        message: "لطفا تکرار رمز عبور را وارد نمایید",
      })
      .min(1, "لطفا تکرار رمز عبور را وارد نمایید"),
  });

export type TNewPasswordFormSchema = z.infer<
  ReturnType<typeof newPasswordFormSchema>
>;
