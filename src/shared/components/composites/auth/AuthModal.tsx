"use client";

import { useState } from "react";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import authService from "@/services/domains/auth/auth.service";
import { useAuthModalStore } from "@/services/authentication-store/useAuthModalStore";

export default function AuthModal() {
  const { isOpen, close } = useAuthModalStore();
  const { setAccessToken } = useTokenStore();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  // -------- SEND OTP --------
  const handleSendOtp = async () => {
    await authService.sendOtp({ phone });
    setStep("otp");
  };

  // -------- VERIFY OTP --------
  const handleVerifyOtp = async () => {
    const res = await authService.verifyOtp({ phone, code });

    const data = res?.data;

    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      close();
      setStep("phone");
      setPhone("");
      setCode("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">ورود / ثبت‌نام</h2>
          <button onClick={close}>✕</button>
        </div>

        {/* STEP 1: PHONE */}
        {step === "phone" && (
          <div className="space-y-3">
            <input
              className="w-full border p-3 rounded-xl"
              placeholder="شماره موبایل"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              className="w-full bg-blue-600 text-white p-3 rounded-xl"
              onClick={handleSendOtp}
            >
              ارسال کد
            </button>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <div className="space-y-3">
            <input
              className="w-full border p-3 rounded-xl"
              placeholder="کد تایید"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              className="w-full bg-blue-600 text-white p-3 rounded-xl"
              onClick={handleVerifyOtp}
            >
              تایید و ورود
            </button>
          </div>
        )}

      </div>
    </div>
  );
}