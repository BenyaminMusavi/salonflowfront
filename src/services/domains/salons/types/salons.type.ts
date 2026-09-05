import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

/** Public catalog card — `id` is salon Guid (publicId). */
export interface ISalonCard {
  id: string;
  name: string;
  imageUrl?: string | null;
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
