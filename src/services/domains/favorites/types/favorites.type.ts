import { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** GET /api/favorites — FavoriteSalonDto (catalog card fields). */
export interface IFavoriteSalon {
  id: number;
  salonId: number;
  salonPublicId: string;
  salonName: string;
  imageUrl?: string | null;
  city?: string | null;
  averageRating?: number | null;
  createdAt: string;
}

export type TFavoritesEntity = TResponse<IFavoriteSalon[]>;
