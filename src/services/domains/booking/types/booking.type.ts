import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface TimeSlotDto {
  start: string;
  end: string;
  staffProfileId?: number;
  isAvailable: boolean;
}

export interface GetAvailableSlotsRequest {
  salonId: string | number;
  branchId: number;
  staffId?: number | null;
  offeringIds: number[];
  date: string;
}

export interface CreateBookingServiceLine {
  offeringId: number;
  staffId: number;
}

export interface CreateBookingRequest {
  salonId: number;
  branchId?: number | null;
  startTime: string;
  notes?: string | null;
  services: CreateBookingServiceLine[];
}

export type AvailableSlotsResponse = TimeSlotDto[];
export type CreateBookingResponse = number;

export type TCreateBookingEntity = TResponse<CreateBookingResponse>;
