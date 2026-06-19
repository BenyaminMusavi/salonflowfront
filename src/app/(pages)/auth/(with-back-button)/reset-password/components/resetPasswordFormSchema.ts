import { z } from 'zod';

export const resetPasswordFormSchema = () =>
  z.object({
    phone: z.string({message: "لطفا شماره موبایل را وارد نمایید"}).min(1, "لطفا شماره موبایل را وارد نمایید"),
  });

export type TResetPasswordFormSchema = z.infer<ReturnType<typeof resetPasswordFormSchema>>;

