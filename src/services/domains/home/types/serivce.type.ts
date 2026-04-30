import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IHomeService {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
}

export type THomeServiceEntity = TResponse<IHomeService[]>; 
