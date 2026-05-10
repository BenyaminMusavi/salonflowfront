import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface TimeSlotDto {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface GetAvailableSlotsRequest {
  salonId: number;
  staffId?: number | null;
  offeringIds: number[];
  date: string;
}

export interface CreateBookingRequest {
  salonId: number;
  staffId?: number | null;
  offeringIds: number[];
  startTime: string;
  customerId : number;
}

export type AvailableSlotsResponse = TimeSlotDto[];
export type CreateBookingResponse = number;