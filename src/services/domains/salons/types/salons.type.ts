import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

/** Public catalog card — `id` is salon Guid (publicId). */
export interface ISalonCard {
  id: string;
  name: string;
  /** Legacy "whatever media is primary, any usage type" pick — kept for back-compat; prefer
   * coverImageUrl/bannerImageUrl below, which are usage-type-filtered and null when unset. */
  imageUrl?: string | null;
  /** MediaUsageType.Cover — falls back to the legacy imageUrl pick server-side when the salon
   * has no typed Cover of its own, so this is rarely null for an approved salon. */
  coverImageUrl?: string | null;
  /** MediaUsageType.Banner — wide image for the search page's featured-salon hero. null until
   * the owner uploads one (no fallback). */
  bannerImageUrl?: string | null;
  genderType?: string | null;
  services?: string | null;
  rating?: number | null;
  distanceKm?: number | null;
  minPrice?: number | null;
  /** Numeric long id when API includes it (reviews / reports). */
  salonId?: number | null;
}

export interface IGetApprovedSalonsParams {
  lat?: number;
  lng?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  genderType?: number;
  /** Guid (ServiceType.PublicId) — the salons list filter, matching every other endpoint's convention. */
  serviceTypePublicId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export type TSalonsEntity = TResponse<TPagedResult<ISalonCard>>;
