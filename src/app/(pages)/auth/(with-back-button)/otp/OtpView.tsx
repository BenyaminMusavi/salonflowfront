import React from "react";
import OtpFormProvider from "@/app/(pages)/auth/(with-back-button)/otp/components/OtpFormProvider";
import OtpForm from "@/app/(pages)/auth/(with-back-button)/otp/components/OtpForm";
import OtpPhoneSubtitle from "@/app/(pages)/auth/(with-back-button)/otp/components/OtpPhoneSubtitle";

const OtpView = () => {
  return (
    <div className={"flex flex-col gap-y-4"}>
      <div className={"flex flex-col gap-y-1"}>
        <h2 className={"flex items-center gap-x-1"}>
          <span className={"text-foreground text-[20px] font-semibold"}>
            تایید شماره همراه
          </span>
        </h2>
        <OtpPhoneSubtitle />
      </div>
      <OtpFormProvider>
        <OtpForm />
      </OtpFormProvider>
    </div>
  );
};

export default OtpView;
