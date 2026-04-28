import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface IServiceType {
  id: number;
  name: string;
}

export type TServiceTypeEntity = TResponse<IServiceType[]>;


interface IService {
  id: number;
  name: string;
  price: number;
  duration?: number;
  description?: string;
}

export type TServicesEntity = TResponse<IService[]>;
