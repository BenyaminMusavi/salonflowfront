import { z } from "zod";

/**
 * Password rules — mirror the backend validators (Set/Reset password): 8–72 characters with an
 * uppercase and a lowercase English letter, a digit and a symbol. One list drives both the live
 * checklist under the field and the form validation, so they can't drift apart.
 */
export const PASSWORD_MAX = 72;

export const PASSWORD_RULES = [
  { id: "length", label: "حداقل 8 کاراکتر", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "یک حرف بزرگ انگلیسی (A-Z)", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "یک حرف کوچک انگلیسی (a-z)", test: (v: string) => /[a-z]/.test(v) },
  { id: "digit", label: "یک عدد (0-9)", test: (v: string) => /\d/.test(v) },
  {
    id: "symbol",
    label: "یک نماد، مثل ! @ # $ %",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

/** Zod field for a NEW password: required, max 72, and a message naming the first missing rule. */
export function newPasswordField(requiredMessage: string) {
  return z
    .string({ message: requiredMessage })
    .min(1, requiredMessage)
    .max(PASSWORD_MAX, `رمز عبور نباید بیشتر از ${PASSWORD_MAX} کاراکتر باشد`)
    .superRefine((value, ctx) => {
      const missing = PASSWORD_RULES.find((rule) => !rule.test(value));
      if (missing) {
        ctx.addIssue({ code: "custom", message: `رمز عبور باید شامل ${missing.label} باشد` });
      }
    });
}
