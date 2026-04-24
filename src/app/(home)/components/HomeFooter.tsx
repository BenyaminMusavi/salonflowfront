export default function HomeFooter() {
  return (
    <footer className="mt-20 border-t bg-white">

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-blue-600">
              SalonFlow
            </h3>

            <p className="text-sm text-gray-500 mt-3 leading-6">
              رزرو آنلاین سالن‌های زیبایی
              <br />
              سریع، ساده و بدون تماس تلفنی
            </p>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              برای مشتریان
            </h4>

            <ul className="space-y-2 text-sm text-gray-600">
              <li>جستجوی سالن</li>
              <li>رزرو آنلاین</li>
              <li>تخفیف‌ها</li>
              <li>راهنما</li>
            </ul>
          </div>

          {/* For Salons */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              برای سالن‌ها
            </h4>

            <ul className="space-y-2 text-sm text-gray-600">
              <li>ثبت سالن</li>
              <li>مدیریت رزروها</li>
              <li>افزایش مشتری</li>
              <li>همکاری با ما</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              پشتیبانی
            </h4>

            <ul className="space-y-2 text-sm text-gray-600">
              <li>سوالات متداول</li>
              <li>تماس با ما</li>
              <li>قوانین</li>
              <li>حریم خصوصی</li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SalonFlow. All rights reserved.
          </p>

          <div className="flex gap-4 text-sm text-gray-500">
            <span>Instagram</span>
            <span>Telegram</span>
            <span>Twitter</span>
          </div>

        </div>

      </div>

    </footer>
  );
}