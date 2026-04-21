import HeroSection from "@/shared/ui/hero-section";
import SearchSection from "@/shared/ui/search-section";
import CategoriesSection from "@/shared/ui/categories-section";
import HomeHeader from "@/shared/ui/home-header";

export default function HomePage() {
  return (
    <main className="bg-white">

      <HomeHeader />

      <div className="relative">
        <HeroSection />
        <SearchSection />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <CategoriesSection />
      </div>

    </main>
  );
}