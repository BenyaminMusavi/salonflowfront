import { z } from "zod";
import { newPasswordField } from "@/shared/utils/passwordRules";

export const newPasswordFormSchema = () =>
  z.object({
    password: newPasswordField("لطفاً رمز عبور جدید را وارد کنید"),
    repeatPassword: z
      .string({
        message: "لطفاً تکرار رمز عبور را وارد کنید",
      })
      .min(1, "لطفاً تکرار رمز عبور را وارد کنید"),
  });

export type TNewPasswordFormSchema = z.infer<
  ReturnType<typeof newPasswordFormSchema>
>;
