import { z } from 'zod';

export const registerFormSchema = () =>
  z.object({
    phone: z.string({message: "لطفا شماره موبایل را وارد نمایید"}).min(1, "لطفا شماره موبایل را وارد نمایید"),
    referralCode: z.string().optional(),
  });

export type TRegisterFormSchema = z.infer<ReturnType<typeof registerFormSchema>>;

