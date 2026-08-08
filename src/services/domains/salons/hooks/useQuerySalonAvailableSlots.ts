import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IGetSalonAvailableSlotsParams } from "../types/booking-browse.type";

export const SALON_AVAILABLE_SLOTS_QUERY_KEY = "SALON_AVAILABLE_SLOTS_QUERY_KEY";

export const useQuerySalonAvailableSlots = (
  params: Partial<IGetSalonAvailableSlotsParams> & {
    enabled?: boolean;
  }
) => {
  const serviceTypePublicIds = [...(params.serviceTypePublicIds ?? [])]
    .filter(Boolean)
    .sort();

  const enabled =
    params.enabled !== false &&
    !!params.branchPublicId &&
    !!params.date &&
    serviceTypePublicIds.length > 0;

  return useQuery({
    queryKey: [
      SALON_AVAILABLE_SLOTS_QUERY_KEY,
      params.branchPublicId,
      params.date,
      serviceTypePublicIds,
      params.staffProfilePublicId ?? null,
    ],
    queryFn: () =>
      salonService.getAvailableSlots({
        branchPublicId: params.branchPublicId!,
        date: params.date!,
        serviceTypePublicIds,
        staffProfilePublicId: params.staffProfilePublicId,
      }),
    enabled,
  });
};
