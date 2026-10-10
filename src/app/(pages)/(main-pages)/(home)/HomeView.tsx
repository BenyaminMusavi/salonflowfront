import React from "react";
import HomeSalons from "@/app/(pages)/(main-pages)/(home)/components/home-salons/HomeSalons";
import HomeHeader from "@/app/(pages)/(main-pages)/(home)/components/home-header/HomeHeader";
import HomeSearch from "@/app/(pages)/(main-pages)/(home)/components/home-search/HomeSearch";
import IncompleteDraftBanner from "@/app/(pages)/(main-pages)/(home)/components/incomplete-draft-banner/IncompleteDraftBanner";
import HomeNextAppointment from "@/app/(pages)/(main-pages)/(home)/components/home-next-appointment/HomeNextAppointment";
import HomeExplore from "@/app/(pages)/(main-pages)/(home)/components/home-explore/HomeExplore";

function HomeView() {
  return (
    <div className="flex flex-col gap-y-5 pb-32 pt-24">
      <HomeHeader />
      <IncompleteDraftBanner />
      <HomeNextAppointment />
      <HomeSearch />
      <HomeSalons />
      <HomeExplore />
      <div className="flex justify-end px-safe-area pt-2">
        <a
          referrerPolicy="origin"
          target="_blank"
          href="https://trustseal.enamad.ir/?id=7712541&Code=Wx8KM798SLBkVoF6xKgfDqKOyoKNffTk"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src="https://trustseal.enamad.ir/logo.aspx?id=7712541&Code=Wx8KM798SLBkVoF6xKgfDqKOyoKNffTk"
            alt="نماد اعتماد الکترونیکی"
            className="h-16 w-auto"
            style={{ cursor: "pointer" }}
            // @ts-expect-error -- eNamad's verification script looks for this exact non-standard "code" attribute; must not become "data-code" or be dropped
            code="Wx8KM798SLBkVoF6xKgfDqKOyoKNffTk"
          />
        </a>
      </div>
    </div>
  );
}

export default HomeView;
