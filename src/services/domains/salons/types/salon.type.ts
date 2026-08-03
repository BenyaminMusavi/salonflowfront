import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";

export interface ISalonGalleryItem {
  url?: string | null;
  imageUrl?: string | null;
  publicId?: string | null;
}

export interface ISalonServiceSummary {
  id: string;
  name: string;
}

export interface ISalonWorkingHour {
  dayName: string;
  start?: string | null;
  end?: string | null;
  isOff: boolean;
}

/** Public salon detail — route `id` is Guid publicId. */
export interface ISalon {
  id: string;
  /** Numeric long id for favorites / booking create when provided by API. */
  salonId?: number | null;
  internalId?: number | null;
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  gallery?: Array<string | ISalonGalleryItem> | null;
  services?: ISalonServiceSummary[] | null;
  branches?: ISalonBranch[] | null;
  workingHours?: ISalonWorkingHour[] | null;
  instagramHandle?: string | null;
  whatsappNumber?: string | null;
  websiteUrl?: string | null;
  rating?: number | null;
  minPrice?: number | null;
  genderType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type TSalonEntity = TResponse<ISalon>;

export function resolveNumericSalonId(salon: {
  salonId?: number | null;
  internalId?: number | null;
}): number | undefined {
  if (typeof salon.salonId === "number" && Number.isFinite(salon.salonId)) {
    return salon.salonId;
  }
  if (typeof salon.internalId === "number" && Number.isFinite(salon.internalId)) {
    return salon.internalId;
  }
  return undefined;
}
