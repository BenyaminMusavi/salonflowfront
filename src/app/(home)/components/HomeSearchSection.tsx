"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/primitives/button/Button";

export default function HomeSearchSection() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const search = () => {
    router.push(`/salons?query=${query}&date=${date}`);
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">

      <div
        className="
          bg-white/90 backdrop-blur-md
          border border-white/40
          rounded-2xl shadow-2xl
          p-4 flex flex-col md:flex-row gap-3
        "
      >

        {/* Search input */}
        <input
          className="
            flex-1 p-3 rounded-xl
            border border-gray-200
            text-gray-900
            placeholder:text-gray-400
            outline-none
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200
            transition
          "
          placeholder="جستجو سالن، شهر یا خدمات..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Persian Date Picker */}


        {/* Button */}
        <Button onClick={search}>
          جستجو
        </Button>

      </div>
    </div>
  );
}