"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchCategories from "@/app/(pages)/(main-pages)/search/components/search-categories/SearchCategories";
import SearchCardGrid from "@/app/(pages)/(main-pages)/search/components/search-card-grid/SearchCardGrid";
import { useQueryApprovedSalons } from "@/services/domains/salons/hooks/useQueryApprovedSalons";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { RouteAddress } from "@/shared/data/routeAddress";

const HOME_SALONS = 6;

/**
 * Home's browse part: categories (tap → search filtered by that service) and a short salon grid
 * with «همه» to the search page. Same components as the search page.
 */
export default function HomeExplore() {
  const router = useRouter();
  const types = useQueryServiceTypes();
  // Same params as the carousel above, so both share one request.
  const salons = useQueryApprovedSalons({ page: 1, pageSize: 8 });
  const items = (salons.data?.data?.items ?? []).slice(0, HOME_SALONS);

  return (
    <>
      <SearchCategories
        categories={types.data?.data ?? []}
        isLoading={types.isLoading}
        onSelect={(id) =>
          router.push(
            id != null
              ? `${RouteAddress.SEARCH.BASE}?${new URLSearchParams({ serviceTypePublicId: String(id) })}`
              : RouteAddress.SEARCH.BASE
          )
        }
      />
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-safe-area">
          <h2 className="text-[16px] font-bold text-foreground">سالن‌ها</h2>
          <Link href={RouteAddress.SEARCH.BASE} className="text-[13px] font-semibold text-primary">
            همه
          </Link>
        </div>
        <SearchCardGrid salons={items} isLoading={salons.isLoading} isError={salons.isError} />
      </section>
    </>
  );
}
