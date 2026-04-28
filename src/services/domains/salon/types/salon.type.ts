import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface ISalon {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  coverImage?: string;
  coverImageUrl?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  description?:string;
  phone?:string;
  logo?:string;
}

export type TSalonEntity = TResponse<ISalon>; 