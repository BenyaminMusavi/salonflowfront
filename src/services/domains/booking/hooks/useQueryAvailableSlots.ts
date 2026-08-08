import { useQuery } from "@tanstack/react-query";
import bookingService from "../booking.service";
import { availableSlotsKey } from "./availableSlotsKey";

interface Params {
  salonPublicId: string | undefined;
  branchPublicId: string | undefined;
  staffPublicId?: string | null;
  offeringPublicIds: string[];
  date: string | undefined;
}

export const AVAILABLE_SLOTS_QUERY_KEY = "available-slots";

export function useQueryAvailableSlots(params: Params) {
  const offeringPublicIds = (params.offeringPublicIds ?? []).filter(Boolean);
  const date = params.date;
  const salonPublicId = params.salonPublicId;
  const branchPublicId = params.branchPublicId;

  const isValid =
    !!salonPublicId &&
    !!branchPublicId &&
    offeringPublicIds.length > 0 &&
    !!date;

  return useQuery({
    queryKey: availableSlotsKey.list({
      salonPublicId: salonPublicId ?? "",
      branchPublicId: branchPublicId ?? "",
      staffPublicId: params.staffPublicId ?? null,
      offeringPublicIds,
      date: date ?? "",
    }),
    enabled: isValid,
    queryFn: () =>
      bookingService.getAvailableSlots({
        salonPublicId: salonPublicId!,
        branchPublicId: branchPublicId!,
        staffPublicId: params.staffPublicId ?? null,
        offeringPublicIds,
        date: date!,
      }),
  });
}
