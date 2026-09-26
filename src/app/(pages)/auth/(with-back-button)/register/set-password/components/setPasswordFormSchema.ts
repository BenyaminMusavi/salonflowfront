import { z } from "zod";
import { newPasswordField } from "@/shared/utils/passwordRules";

export const setPasswordFormSchema = () =>
  z
    .object({
      password: newPasswordField("لطفا رمز عبور را وارد نمایید"),
      repeatPassword: z
        .string({ message: "لطفا تکرار رمز عبور را وارد نمایید" })
        .min(1, "لطفا تکرار رمز عبور را وارد نمایید"),
    })
    .refine((data) => data.password === data.repeatPassword, {
      message: "رمز عبور با تکرار آن مطابقت ندارد",
      path: ["repeatPassword"],
    });

export type TSetPasswordFormSchema = z.infer<
  ReturnType<typeof setPasswordFormSchema>
>;
