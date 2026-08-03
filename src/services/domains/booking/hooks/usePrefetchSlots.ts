import { useQueryClient } from "@tanstack/react-query";
import bookingService from "../booking.service";
import { availableSlotsKey } from "./availableSlotsKey";

export const usePrefetchSlots = () => {
  const queryClient = useQueryClient();

  const prefetchSlots = (params: {
    salonId: string | number;
    branchId: number;
    staffId?: number | null;
    offeringIds: number[];
    date: string;
  }) => {
    return queryClient.prefetchQuery({
      queryKey: availableSlotsKey.list({
        salonId: params.salonId,
        branchId: params.branchId,
        staffId: params.staffId ?? null,
        offeringIds: params.offeringIds,
        date: params.date,
      }),
      queryFn: () =>
        bookingService.getAvailableSlots({
          salonId: params.salonId,
          branchId: params.branchId,
          staffId: params.staffId ?? null,
          offeringIds: params.offeringIds,
          date: params.date,
        }),
      staleTime: 30_000,
    });
  };

  return { prefetchSlots };
};
