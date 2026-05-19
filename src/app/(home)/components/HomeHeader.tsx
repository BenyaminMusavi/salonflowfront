"use client";

import { Button } from "@/shared/components/primitives/button/Button";
import { useAuthModalStore } from "@/services/authentication-store/useAuthModalStore";

export default function HomeHeader() {
  const { open } = useAuthModalStore();

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <div className="font-bold text-lg text-blue-600">
          SalonFlow
        </div>

        <div className="flex items-center gap-5 text-sm text-gray-700">

          <button className="hover:text-blue-600 transition">
            همکاری با ما
          </button>

          <button className="hover:text-blue-600 transition">
            پشتیبانی
          </button>

          <Button onClick={open}>
            ورود / ثبت‌نام
          </Button>

        </div>
      </div>
    </header>
  );
}