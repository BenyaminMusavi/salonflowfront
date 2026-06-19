import React from "react";
import HomeSalons from "@/app/(pages)/(main-pages)/(home)/components/home-salons/HomeSalons";
import HomeHeader from "@/app/(pages)/(main-pages)/(home)/components/home-header/HomeHeader";
import HomeSearch from "@/app/(pages)/(main-pages)/(home)/components/home-search/HomeSearch";

function HomeView() {
  return (
    <div className="flex flex-col gap-y-4 pb-6 pt-24">
      <HomeHeader />
      <HomeSalons />
      <HomeSearch />
    </div>
  );
}

export default HomeView;
