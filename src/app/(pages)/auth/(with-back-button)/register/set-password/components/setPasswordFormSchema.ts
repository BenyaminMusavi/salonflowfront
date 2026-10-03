import { z } from "zod";
import { newPasswordField } from "@/shared/utils/passwordRules";

export const setPasswordFormSchema = () =>
  z
    .object({
      // Backend allows up to 100 characters each; both are required on first sign-up.
      firstName: z
        .string({ message: "لطفا نام را وارد نمایید" })
        .trim()
        .min(1, "لطفا نام را وارد نمایید")
        .max(100, "نام نباید بیشتر از 100 کاراکتر باشد"),
      lastName: z
        .string({ message: "لطفا نام خانوادگی را وارد نمایید" })
        .trim()
        .min(1, "لطفا نام خانوادگی را وارد نمایید")
        .max(100, "نام خانوادگی نباید بیشتر از 100 کاراکتر باشد"),
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
