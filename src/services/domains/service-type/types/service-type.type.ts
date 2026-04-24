import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface IServiceType {
  id: number;
  name: string;
}

export type TServiceTypeEntity = TResponse<IServiceType[]>;
