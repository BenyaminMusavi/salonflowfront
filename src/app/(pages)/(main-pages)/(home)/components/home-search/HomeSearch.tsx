"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export default function HomeSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const search = () => {
    router.push(`/salons?query=${query}&date=${date}`);
  };

  return (
    <div className="px-safe-area">
      <div className="flex gap-3 items-center">
        {/* Search Wrapper */}
        <div className="relative flex-1">
          {/* Icon */}
          <MagnifyingGlassIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />

          {/* Input */}
          <input
            className="
              w-full pl-10 pr-4 py-3
              rounded-full
              border bg-foreground/5
              text-gray-900
              placeholder:text-gray-400
              outline-none
              focus:ring-2 focus:ring-foreground/10
              transition
              text-[14px]
            "
            placeholder="جستجو سالن، شهر یا خدمات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </div>

        {/* optional date input stays untouched */}
      </div>
    </div>
  );
}