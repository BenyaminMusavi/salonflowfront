import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface TimeSlotDto {
  start: string;
  end: string;
  staffPublicId?: string | null;
  isAvailable: boolean;
}

export interface GetAvailableSlotsRequest {
  salonPublicId: string;
  branchPublicId: string;
  staffPublicId?: string | null;
  offeringPublicIds: string[];
  date: string;
}

export interface CreateBookingServiceLine {
  offeringPublicId: string;
  staffPublicId: string;
}

export interface CreateBookingRequest {
  salonPublicId: string;
  branchPublicId?: string | null;
  startTime: string;
  notes?: string | null;
  services: CreateBookingServiceLine[];
}

export type AvailableSlotsResponse = TimeSlotDto[];
/** Appointment.PublicId (Guid) */
export type CreateBookingResponse = string;

export type TCreateBookingEntity = TResponse<CreateBookingResponse>;
