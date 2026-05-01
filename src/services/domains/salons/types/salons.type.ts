import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface ISalons {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  coverImageUrl?: string;
}

export type TSalonsEntity = TResponse<ISalons[]>; 