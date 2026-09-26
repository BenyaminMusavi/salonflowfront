import { z } from "zod";
import { newPasswordField } from "@/shared/utils/passwordRules";

export const newPasswordFormSchema = () =>
  z.object({
    password: newPasswordField("لطفا رمز عبور جدید را وارد نمایید"),
    repeatPassword: z
      .string({
        message: "لطفا تکرار رمز عبور را وارد نمایید",
      })
      .min(1, "لطفا تکرار رمز عبور را وارد نمایید"),
  });

export type TNewPasswordFormSchema = z.infer<
  ReturnType<typeof newPasswordFormSchema>
>;
