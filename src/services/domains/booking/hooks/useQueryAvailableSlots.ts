"use client";

import { useQuery } from "@tanstack/react-query";
import bookingService from "../booking.service";

interface Params {
  salonId: number;
  staffId?: number | null;
  offeringIds: number[];
  date: string;
}

export function useQueryAvailableSlots(params: Params) {
  const salonId = Number(params.salonId);
  const offeringIds = (params.offeringIds ?? []).filter(Boolean);
  const date = params.date;

  const isValid =
    Number.isFinite(salonId) &&
    salonId > 0 &&
    offeringIds.length > 0 &&
    !!date;

  return useQuery({
    queryKey: [
      "available-slots",
      salonId,
      params.staffId ?? null,
      date,
      offeringIds,
    ],

    enabled: isValid,

    queryFn: () =>
      bookingService.getAvailableSlots({
        salonId,
        staffId: params.staffId ?? null,
        offeringIds,
        date,
      }),
  });
}