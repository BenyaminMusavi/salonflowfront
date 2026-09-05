import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IGetSalonAvailableSlotsParams } from "../types/booking-browse.type";

export const SALON_AVAILABLE_SLOTS_QUERY_KEY = "SALON_AVAILABLE_SLOTS_QUERY_KEY";

export const useQuerySalonAvailableSlots = (
  params: Partial<IGetSalonAvailableSlotsParams> & {
    enabled?: boolean;
  }
) => {
  const offeringPublicIds = [...(params.offeringPublicIds ?? [])]
    .filter(Boolean)
    .sort();

  const enabled =
    params.enabled !== false &&
    !!params.salonPublicId &&
    !!params.branchPublicId &&
    !!params.date &&
    offeringPublicIds.length > 0;

  return useQuery({
    queryKey: [
      SALON_AVAILABLE_SLOTS_QUERY_KEY,
      params.salonPublicId,
      params.branchPublicId,
      params.date,
      offeringPublicIds,
      params.staffProfilePublicId ?? null,
    ],
    queryFn: () =>
      salonService.getAvailableSlots({
        salonPublicId: params.salonPublicId!,
        branchPublicId: params.branchPublicId!,
        date: params.date!,
        offeringPublicIds,
        staffProfilePublicId: params.staffProfilePublicId,
      }),
    enabled,
  });
};
