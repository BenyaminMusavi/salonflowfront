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
  /** MediaUsageType.Banner — wide promotional image used in the search page's featured-salon
   * hero carousel. null until the owner uploads one (Cover/Gallery are unaffected either way). */
  bannerImageUrl?: string | null;
  /** MediaUsageType.Profile — shown in the app as the salon's "logo". */
  imageUrl?: string | null;
  /** Media.PublicId for each picked image — lets the owner-edit page delete/replace one without
   * risking an unrelated not-yet-identified image, the way Gallery items already can. Null when
   * no media of that usage type exists yet. */
  coverMediaPublicId?: string | null;
  bannerMediaPublicId?: string | null;
  imageMediaPublicId?: string | null;
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
