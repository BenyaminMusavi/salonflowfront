import { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** GET /api/favorites — FavoriteSalonDto (catalog card fields). */
export interface IFavoriteSalon {
  id: number;
  salonId: number;
  salonPublicId: string;
  salonName: string;
  imageUrl?: string | null;
  city?: string | null;
  /** null = no approved review yet («بدون امتیاز»), not zero. */
  averageRating?: number | null;
  reviewCount?: number | null;
  createdAt: string;
}

export type TFavoritesEntity = TResponse<IFavoriteSalon[]>;
