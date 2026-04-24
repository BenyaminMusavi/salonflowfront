import { Button } from "@/shared/components/primitives/button/Button";

export default function HomeHeader() {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="font-bold text-lg text-blue-600">
          SalonFlow
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5 text-sm text-gray-700">

          <button className="hover:text-blue-600 transition">
            همکاری با ما
          </button>

          <button className="hover:text-blue-600 transition">
            پشتیبانی
          </button>

          <Button>
            ورود / ثبت‌نام
          </Button>
        </div>
      </div>
    </header>
  );
}