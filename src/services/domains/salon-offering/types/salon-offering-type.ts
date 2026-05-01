import { TResponse } from "@/services/common/data-types/SharedDataTypes";

// یک ردیف سرویس سالن
export interface ISalonOffering {
  id: number;
  serviceTypeId: number;
  serviceName: string;
  basePrice: number;
  durationMinutes: number;
  pricingType: number;
}

// خروجی API — لیست سرویس‌ها
export type TSalonOfferingEntity = TResponse<ISalonOffering[]>;
