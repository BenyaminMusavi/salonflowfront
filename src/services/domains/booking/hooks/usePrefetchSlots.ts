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
    const safeParams = {
      salonId: params.salonId,
      staffId: params.staffId ?? null,
      offeringIds: [...params.offeringIds].sort(),
      date: params.date,
    };

    return queryClient.prefetchQuery({
      queryKey: [
        "available-slots",
        safeParams.salonId,
        safeParams.staffId,
        safeParams.date,
        safeParams.offeringIds,
      ],

      queryFn: () =>
        bookingService.getAvailableSlots({
          ...safeParams,
          date: safeParams.date + "T00:00:00",
        }),

      staleTime: 30_000,
    });
  };

  return { prefetchSlots };
};