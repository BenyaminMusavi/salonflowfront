export default function HomeHeroSection() {
  return (
    <section className="relative w-full h-[70vh] flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl text-white md:text-5xl font-bold mb-4">
          رزرو آنلاین سالن‌های زیبایی
        </h1>

        <p className="text-gray-200 mb-8">
          سریع، ساده و بدون تماس تلفنی نوبت بگیر
        </p>
      </div>
    </section>
  );
}