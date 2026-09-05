"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchHeader from "./components/search-header/SearchHeader";
import SearchHero from "./components/search-hero/SearchHero";
import SearchCategories from "./components/search-categories/SearchCategories";
import SearchSegmentedToggle from "./components/search-segmented-toggle/SearchSegmentedToggle";
import SearchCardGrid from "./components/search-card-grid/SearchCardGrid";
import { useQueryApprovedSalons } from "@/services/domains/salons/hooks/useQueryApprovedSalons";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlServiceTypePublicId = searchParams.get("serviceTypePublicId");

  const [activeTab, setActiveTab] = useState<"new" | "recommended">("new");
  const [draftSearch, setDraftSearch] = useState(urlSearch);

  useEffect(() => {
    setDraftSearch(urlSearch);
  }, [urlSearch]);

  const syncUrl = useCallback(
    (next: { search?: string; serviceTypePublicId?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      const search =
        next.search !== undefined ? next.search.trim() : urlSearch.trim();
      if (search) params.set("search", search);
      else params.delete("search");

      const serviceTypePublicId =
        next.serviceTypePublicId !== undefined
          ? next.serviceTypePublicId
          : urlServiceTypePublicId;
      if (serviceTypePublicId != null && serviceTypePublicId !== "") {
        params.set("serviceTypePublicId", serviceTypePublicId);
      } else {
        params.delete("serviceTypePublicId");
      }

      const qs = params.toString();
      router.replace(
        qs ? `${RouteAddress.SEARCH.BASE}?${qs}` : RouteAddress.SEARCH.BASE
      );
    },
    [router, searchParams, urlSearch, urlServiceTypePublicId]
  );

  const { data: salonsRes, isLoading, isError } = useQueryApprovedSalons({
    page: 1,
    pageSize: 20,
    search: urlSearch || undefined,
    serviceTypePublicId: urlServiceTypePublicId || undefined,
  });

  const { data: serviceTypesRes, isLoading: typesLoading } =
    useQueryServiceTypes();

  const salons = salonsRes?.data?.items ?? [];
  const categories = serviceTypesRes?.data ?? [];

  return (
    <div className="flex flex-col gap-5 pt-20 pb-32">
      <SearchHeader
        value={draftSearch}
        onChange={setDraftSearch}
        onSubmit={() => syncUrl({ search: draftSearch })}
      />
      <SearchHero salons={salons} />
      <SearchCategories
        categories={categories}
        selectedId={urlServiceTypePublicId}
        isLoading={typesLoading}
        onSelect={(id) =>
          syncUrl({ serviceTypePublicId: id != null ? String(id) : null })
        }
      />
      <SearchSegmentedToggle activeTab={activeTab} onTabChange={setActiveTab} />
      <SearchCardGrid
        salons={salons}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
