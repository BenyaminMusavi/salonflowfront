import { z } from 'zod';

export const loginFormSchema = () =>
  z.object({
    phone: z.string({
      message: "لطفا شماره موبایل را وارد نمایید"
    }).min(1, "لطفا شماره موبایل را وارد نمایید"),
    password: z.string({
      message: "لطفا رمز عبور را وارد نمایید"
    }).min(1, "لطفا رمز عبور را وارد نمایید"),
  });

export type TLoginFormSchema = z.infer<ReturnType<typeof loginFormSchema>>;

