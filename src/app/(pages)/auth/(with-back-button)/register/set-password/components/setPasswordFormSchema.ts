import { z } from "zod";
import { PASSWORD_MAX, PASSWORD_RULES } from "@/shared/utils/passwordRules";

/**
 * «تکمیل حساب» after the SMS code. `askName` / `withPassword` are form flags (not sent):
 * the name is required only while the account has none, the password only if the user opens it.
 */
export const setPasswordFormSchema = () =>
  z
    .object({
      askName: z.boolean(),
      withPassword: z.boolean(),
      firstName: z.string(),
      lastName: z.string(),
      password: z.string(),
      repeatPassword: z.string(),
    })
    .superRefine((d, ctx) => {
      if (d.askName) {
        const first = d.firstName.trim();
        const last = d.lastName.trim();
        if (!first) ctx.addIssue({ code: "custom", path: ["firstName"], message: "لطفاً نام را وارد کنید" });
        else if (first.length > 100)
          ctx.addIssue({ code: "custom", path: ["firstName"], message: "نام نباید بیشتر از 100 کاراکتر باشد" });
        if (!last) ctx.addIssue({ code: "custom", path: ["lastName"], message: "لطفاً نام خانوادگی را وارد کنید" });
        else if (last.length > 100)
          ctx.addIssue({ code: "custom", path: ["lastName"], message: "نام خانوادگی نباید بیشتر از 100 کاراکتر باشد" });
      }
      if (d.withPassword) {
        // Same rules as newPasswordField (PASSWORD_RULES mirrors the backend).
        if (!d.password) {
          ctx.addIssue({ code: "custom", path: ["password"], message: "لطفاً رمز عبور را وارد کنید" });
        } else if (d.password.length > PASSWORD_MAX) {
          ctx.addIssue({ code: "custom", path: ["password"], message: `رمز عبور نباید بیشتر از ${PASSWORD_MAX} کاراکتر باشد` });
        } else {
          const missing = PASSWORD_RULES.find((rule) => !rule.test(d.password));
          if (missing) ctx.addIssue({ code: "custom", path: ["password"], message: `رمز عبور باید شامل ${missing.label} باشد` });
        }
        if (!d.repeatPassword)
          ctx.addIssue({ code: "custom", path: ["repeatPassword"], message: "لطفاً تکرار رمز عبور را وارد کنید" });
        else if (d.password !== d.repeatPassword)
          ctx.addIssue({ code: "custom", path: ["repeatPassword"], message: "رمز عبور با تکرار آن مطابقت ندارد" });
      }
    });

export type TSetPasswordFormSchema = z.infer<ReturnType<typeof setPasswordFormSchema>>;
