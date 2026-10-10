import { z } from "zod";

const PHONE_RULE = /^09\d{9}$/;

export const phoneStartFormSchema = () =>
  z.object({
    phone: z
      .string({ message: "لطفاً شماره موبایل را وارد کنید" })
      .regex(PHONE_RULE, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
  });

export type TPhoneStartFormSchema = z.infer<ReturnType<typeof phoneStartFormSchema>>;
