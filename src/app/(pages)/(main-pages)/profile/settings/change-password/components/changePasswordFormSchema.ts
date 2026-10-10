import { z } from "zod";
import { newPasswordField } from "@/shared/utils/passwordRules";

/**
 * `hasPassword` comes from the login/OTP response (SF-QA-034): an OTP-only user who has
 * never set a password has nothing to confirm, and the backend itself ignores oldPassword
 * for that case (AuthService.SetPasswordAsync only checks it when a PasswordHash already
 * exists) — requiring it here just blocks their first password with no visible error.
 */
export const changePasswordFormSchema = (hasPassword: boolean) =>
  z
    .object({
      oldPassword: hasPassword
        ? z
            .string({ message: "لطفاً رمز عبور فعلی را وارد کنید" })
            .min(1, "لطفاً رمز عبور فعلی را وارد کنید")
        : z.string().optional(),
      password: newPasswordField("لطفاً رمز عبور جدید را وارد کنید"),
      repeatPassword: z
        .string({ message: "لطفاً تکرار رمز عبور جدید را وارد کنید" })
        .min(1, "لطفاً تکرار رمز عبور جدید را وارد کنید"),
    })
    .refine((data) => data.password === data.repeatPassword, {
      message: "رمز عبور جدید با تکرار آن مطابقت ندارد",
      path: ["repeatPassword"],
    });

export type TChangePasswordFormSchema = z.infer<
  ReturnType<typeof changePasswordFormSchema>
>;
