import { z } from "zod";

// Mirrors the backend rule (BACKEND_UPDATE_REPORT.md): 8+ chars, upper, lower, digit, special.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const setPasswordFormSchema = () =>
  z
    .object({
      password: z
        .string({ message: "لطفا رمز عبور را وارد نمایید" })
        .min(8, "رمز عبور باید حداقل 8 کاراکتر باشد")
        .regex(
          PASSWORD_RULE,
          "رمز عبور باید شامل حروف بزرگ، کوچک، عدد و کاراکتر ویژه باشد"
        ),
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
