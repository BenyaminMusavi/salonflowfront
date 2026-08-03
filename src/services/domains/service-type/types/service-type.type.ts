import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IServiceType {
  id: string | number;
  name: string;
  displayOrder?: number;
  imageUrl?: string | null;
}

export type TServiceTypeEntity = TResponse<IServiceType[]>;

export interface IService {
  id: number;
  name: string;
  price: number;
  duration?: number;
  description?: string;
}

export type TServicesEntity = TResponse<IService[]>;
