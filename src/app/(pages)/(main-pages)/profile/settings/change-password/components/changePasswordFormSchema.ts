import { z } from "zod";

// Mirrors the backend rule (unchanged by this update): 8+ chars, upper, lower, digit, special.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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
            .string({ message: "لطفا رمز عبور فعلی را وارد نمایید" })
            .min(1, "لطفا رمز عبور فعلی را وارد نمایید")
        : z.string().optional(),
      password: z
        .string({ message: "لطفا رمز عبور جدید را وارد نمایید" })
        .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
        .regex(
          PASSWORD_RULE,
          "رمز عبور باید شامل حروف بزرگ، کوچک، عدد و کاراکتر ویژه باشد"
        ),
      repeatPassword: z
        .string({ message: "لطفا تکرار رمز عبور جدید را وارد نمایید" })
        .min(1, "لطفا تکرار رمز عبور جدید را وارد نمایید"),
    })
    .refine((data) => data.password === data.repeatPassword, {
      message: "رمز عبور جدید با تکرار آن مطابقت ندارد",
      path: ["repeatPassword"],
    });

export type TChangePasswordFormSchema = z.infer<
  ReturnType<typeof changePasswordFormSchema>
>;
