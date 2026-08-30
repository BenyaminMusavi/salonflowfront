import { z } from 'zod';

const PHONE_RULE = /^09\d{9}$/;

export const registerFormSchema = () =>
  z.object({
    phone: z.string({message: "لطفا شماره موبایل را وارد نمایید"}).regex(PHONE_RULE, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
    referralCode: z.string().optional(),
  });

export type TRegisterFormSchema = z.infer<ReturnType<typeof registerFormSchema>>;

