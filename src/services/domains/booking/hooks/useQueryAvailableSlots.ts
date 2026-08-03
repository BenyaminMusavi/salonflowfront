import { useQuery } from "@tanstack/react-query";
import bookingService from "../booking.service";
import { availableSlotsKey } from "./availableSlotsKey";

interface Params {
  salonId: string | number;
  branchId: number;
  staffId?: number | null;
  offeringIds: number[];
  date: string;
}

export const AVAILABLE_SLOTS_QUERY_KEY = "available-slots";

export function useQueryAvailableSlots(params: Params) {
  const offeringIds = (params.offeringIds ?? []).filter(Boolean);
  const date = params.date;
  const branchId = Number(params.branchId);

  const isValid =
    params.salonId !== undefined &&
    params.salonId !== null &&
    params.salonId !== "" &&
    Number.isFinite(branchId) &&
    branchId > 0 &&
    offeringIds.length > 0 &&
    !!date;

  return useQuery({
    queryKey: availableSlotsKey.list({
      salonId: params.salonId,
      branchId,
      staffId: params.staffId ?? null,
      offeringIds,
      date,
    }),
    enabled: isValid,
    queryFn: () =>
      bookingService.getAvailableSlots({
        salonId: params.salonId,
        branchId,
        staffId: params.staffId ?? null,
        offeringIds,
        date,
      }),
  });
}
