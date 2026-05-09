import { useQueryClient } from "@tanstack/react-query";
import bookingService from "../booking.service";

export const usePrefetchSlots = () => {
  const queryClient = useQueryClient();

  const prefetchSlots = (params: {
    salonId: number;
    staffId?: number | null;
    offeringIds: number[];
    date: string;
  }) => {
    return queryClient.prefetchQuery({
      queryKey: [
        "available-slots",
        params.salonId,
        params.staffId ?? null,
        params.date,
        params.offeringIds,
      ],

      queryFn: () =>
        bookingService.getAvailableSlots({
          salonId: params.salonId,
          staffId: params.staffId ?? null,
          offeringIds: params.offeringIds,
          date: params.date,
        }),

      staleTime: 30_000,
    });
  };

  return { prefetchSlots };
};