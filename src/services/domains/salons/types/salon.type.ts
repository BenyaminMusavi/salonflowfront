import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";

export interface ISalonGalleryItem {
  url?: string | null;
  imageUrl?: string | null;
  publicId?: string | null;
}

export interface ISalonServiceSummary {
  name: string;
  /** ServiceOffering.PublicId from GET /api/salons/{id} */
  offeringPublicId?: string | null;
  /** @deprecated Prefer offeringPublicId */
  id?: string | null;
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
  /** Salon.Id — required by GET /api/reviews?salonId= and POST /api/salon-reports, which still take long, not Guid. */
  salonId: number;
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
  /** SalonApprovalStatus: 1 Pending, 2 Approved, 3 Rejected, 4 Draft. */
  approvalStatus?: number | null;
  /** Admin-provided reason, set only when approvalStatus is Rejected. */
  rejectionReason?: string | null;
}

export type TSalonEntity = TResponse<ISalon>;
