import { z } from 'zod';

const PHONE_RULE = /^09\d{9}$/;

export const loginFormSchema = () =>
  z.object({
    phone: z.string({
      message: "لطفاً شماره موبایل را وارد کنید"
    }).regex(PHONE_RULE, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
    password: z.string({
      message: "لطفاً رمز عبور را وارد کنید"
    }).min(1, "لطفاً رمز عبور را وارد کنید"),
  });

export type TLoginFormSchema = z.infer<ReturnType<typeof loginFormSchema>>;

