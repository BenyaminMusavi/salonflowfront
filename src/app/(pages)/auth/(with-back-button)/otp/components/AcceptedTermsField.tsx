"use client";

import React from "react";
import { Control } from "react-hook-form";
import { CheckboxReactHookForm } from "@/shared/components/primitives/checkbox/CheckboxReactHookForm";
import { TOtpFormSchema } from "./otpFormSchema";

export default function AcceptedTermsField({
  control,
}: {
  control: Control<TOtpFormSchema>;
}) {
  return (
    <CheckboxReactHookForm
      control={control}
      name="acceptedTerms"
      label={
        <>
          {/* TODO: link to the real Terms/Privacy URLs once product & legal finalize
              them — first-pass drafts exist backend-side but aren't publish-ready yet
              (see BACKEND_UPDATE_REPORT.md §1.2). */}
          با <span className="font-medium text-primary">قوانین و مقررات</span> و{" "}
          <span className="font-medium text-primary">حریم خصوصی</span> سالن‌فلو موافقم
        </>
      }
    />
  );
}
