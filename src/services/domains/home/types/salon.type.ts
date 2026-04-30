import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IHomeSalon {
  id: number;
  name: string;

  city?: string;
  address?: string;
  phone?: string;

  rating?: number;

  imageUrl?: string;
}

export type THomeSalonEntity = TResponse<IHomeSalon[]>;
