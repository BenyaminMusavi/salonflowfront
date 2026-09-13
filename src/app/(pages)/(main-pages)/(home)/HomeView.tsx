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
      <div className="flex justify-center pt-2">
        <a
          referrerPolicy="origin"
          target="_blank"
          href="https://trustseal.enamad.ir/?id=7712541&Code=Wx8KM798SLBkVoF6xKgfDqKOyoKNffTk"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src="https://trustseal.enamad.ir/logo.aspx?id=7712541&Code=Wx8KM798SLBkVoF6xKgfDqKOyoKNffTk"
            alt=""
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
