import { z } from "zod";

// Mirrors the backend rule (unchanged by this update): 8+ chars, upper, lower, digit, special.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const changePasswordFormSchema = () =>
  z
    .object({
      oldPassword: z
        .string({ message: "لطفا رمز عبور فعلی را وارد نمایید" })
        .min(1, "لطفا رمز عبور فعلی را وارد نمایید"),
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
