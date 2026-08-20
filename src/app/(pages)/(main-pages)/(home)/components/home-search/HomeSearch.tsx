"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const search = () => {
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("search", trimmed);
    const qs = params.toString();
    router.push(
      qs ? `${RouteAddress.SEARCH.BASE}?${qs}` : RouteAddress.SEARCH.BASE
    );
  };

  return (
    <div className="px-safe-area">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />

          <input
            className="
              w-full pl-10 pr-4 py-3
              rounded-full
              border bg-foreground/5
              text-foreground
              placeholder:text-input-placeholder
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
      </div>
    </div>
  );
}
