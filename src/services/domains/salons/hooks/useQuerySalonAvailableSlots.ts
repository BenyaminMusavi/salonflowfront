import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IGetSalonAvailableSlotsParams } from "../types/booking-browse.type";

export const SALON_AVAILABLE_SLOTS_QUERY_KEY = "SALON_AVAILABLE_SLOTS_QUERY_KEY";

export const useQuerySalonAvailableSlots = (
  params: Partial<IGetSalonAvailableSlotsParams> & {
    enabled?: boolean;
  }
) => {
  const serviceTypeIds = [...(params.serviceTypeIds ?? [])]
    .filter((id) => id > 0)
    .sort((a, b) => a - b);

  const enabled =
    params.enabled !== false &&
    typeof params.branchId === "number" &&
    params.branchId > 0 &&
    !!params.date &&
    serviceTypeIds.length > 0;

  return useQuery({
    queryKey: [
      SALON_AVAILABLE_SLOTS_QUERY_KEY,
      params.branchId,
      params.date,
      serviceTypeIds,
      params.staffProfilePublicId ?? null,
    ],
    queryFn: () =>
      salonService.getAvailableSlots({
        branchId: params.branchId!,
        date: params.date!,
        serviceTypeIds,
        staffProfilePublicId: params.staffProfilePublicId,
      }),
    enabled,
  });
};
