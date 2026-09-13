import { z } from "zod";

export const editNameFormSchema = z.object({
  firstName: z
    .string({ message: "لطفا نام را وارد نمایید" })
    .min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z
    .string({ message: "لطفا نام خانوادگی را وارد نمایید" })
    .min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
});

export type TEditNameFormSchema = z.infer<typeof editNameFormSchema>;
