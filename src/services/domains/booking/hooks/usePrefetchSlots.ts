import { useQueryClient } from "@tanstack/react-query";
import bookingService from "../booking.service";
import { availableSlotsKey } from "./availableSlotsKey";

export const usePrefetchSlots = () => {
  const queryClient = useQueryClient();

  const prefetchSlots = (params: {
    salonPublicId: string;
    branchPublicId: string;
    staffPublicId?: string | null;
    offeringPublicIds: string[];
    date: string;
  }) => {
    return queryClient.prefetchQuery({
      queryKey: availableSlotsKey.list({
        salonPublicId: params.salonPublicId,
        branchPublicId: params.branchPublicId,
        staffPublicId: params.staffPublicId ?? null,
        offeringPublicIds: params.offeringPublicIds,
        date: params.date,
      }),
      queryFn: () =>
        bookingService.getAvailableSlots({
          salonPublicId: params.salonPublicId,
          branchPublicId: params.branchPublicId,
          staffPublicId: params.staffPublicId ?? null,
          offeringPublicIds: params.offeringPublicIds,
          date: params.date,
        }),
      staleTime: 30_000,
    });
  };

  return { prefetchSlots };
};
