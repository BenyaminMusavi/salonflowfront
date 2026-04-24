import HomeHeroSection from "@/app/(home)/components/HomeHeroSection";
import HomeSearchSection from "@/app/(home)/components/HomeSearchSection";
import HomeCategoriesSection from "@/app/(home)/components/HomeCategoriesSection";
import HomeHeader from "@/app/(home)/components/HomeHeader";
import HomeSalonPreviewSection from "@/app/(home)/components/HomeSalonPreviewSection";
import HomeFooter from "@/app/(home)/components/HomeFooter";

export default function HomePage() {
  return (
    <div className="bg-white">
      <HomeHeader />
      <div className="relative">
        <HomeHeroSection />
        <HomeSearchSection />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <HomeCategoriesSection />
        <HomeSalonPreviewSection />
      </div>

      {/* 🔥 Footer (important trust layer) */}
      <HomeFooter />
    </div>
  );
}
