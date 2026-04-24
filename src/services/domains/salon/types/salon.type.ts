import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface ISalon {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  coverImageUrl?: string;
}

export type TSalonEntity = TResponse<ISalon[]>;