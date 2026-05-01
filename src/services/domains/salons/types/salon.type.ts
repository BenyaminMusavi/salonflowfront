import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ISalon {
  id: number;
  name: string;
  address?: string;
  description?: string;
  city?: string;
  phone?: string;
  coverImageUrl?: string;
  instagramHandle?: string;
  whatsappNumber?: string;
  websiteUrl?: string;
  latitude?: number;
  longitude?: number;
}

export type TSalonEntity = TResponse<ISalon>; 