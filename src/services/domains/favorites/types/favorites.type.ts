import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IFavoriteSalon {
  id: number;
  salonId: number;
  salonName: string;
  createdAt: string;
}

export type TFavoritesEntity = TResponse<IFavoriteSalon[]>;
