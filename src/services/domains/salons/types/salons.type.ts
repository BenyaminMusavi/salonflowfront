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
  /** Real audience from the salon's active branches: 1 men, 2 women, 3 mixed (several different audiences = mixed). */
  genderAudience?: number | null;
  services?: string | null;
  /** null = no approved review yet («بدون امتیاز»), not zero. */
  rating?: number | null;
  reviewCount?: number | null;
  /** Straight-line km to the representative branch; only when lat/lng were sent and the salon has coordinates. */
  distanceKm?: number | null;
  /** Representative branch: nearest active branch with coordinates (oldest one without a reference). null = no location on file. */
  branchPublicId?: string | null;
  branchName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  /** Only with lat/lng; 1–50 km (backend cap). */
  radiusKm?: number;
}

export type TSalonsEntity = TResponse<TPagedResult<ISalonCard>>;

/** Visible map rectangle (WGS84); west < east, south < north. */
export interface IMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** One pin = one active branch with coordinates. `id` is the salon Guid, `branchPublicId` the branch. */
export interface ISalonMapPin {
  id: string;
  username: string;
  name: string;
  rating?: number | null;
  reviewCount?: number | null;
  branchPublicId: string;
  branchName: string;
  latitude: number;
  longitude: number;
  /** This branch's own audience: 1 men, 2 women, 3 mixed (never the salon's overall one). */
  genderType: number;
  distanceKm?: number | null;
}

export interface IMapPinsResult {
  items: ISalonMapPin[];
  /** More than 200 branches in the box: only the nearest / oldest were returned — the user should zoom in. */
  isTruncated: boolean;
}

export type TMapPinsEntity = TResponse<IMapPinsResult>;

/** Same filters as the list (no radius: the box is the area) plus the visible bounds. */
export interface IGetMapPinsParams extends IMapBounds {
  lat?: number;
  lng?: number;
  search?: string;
  genderType?: number;
  serviceTypePublicId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}
