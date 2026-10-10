import { z } from 'zod';

export const resetPasswordFormSchema = () =>
  z.object({
    phone: z.string({message: "لطفاً شماره موبایل را وارد کنید"}).min(1, "لطفاً شماره موبایل را وارد کنید"),
  });

export type TResetPasswordFormSchema = z.infer<ReturnType<typeof resetPasswordFormSchema>>;

