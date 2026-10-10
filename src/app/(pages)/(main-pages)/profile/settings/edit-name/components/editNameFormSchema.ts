import { z } from "zod";

export const editNameFormSchema = z.object({
  firstName: z
    .string({ message: "لطفاً نام را وارد کنید" })
    .min(2, "نام باید حداقل 2 کاراکتر باشد"),
  lastName: z
    .string({ message: "لطفاً نام خانوادگی را وارد کنید" })
    .min(2, "نام خانوادگی باید حداقل 2 کاراکتر باشد"),
});

export type TEditNameFormSchema = z.infer<typeof editNameFormSchema>;
