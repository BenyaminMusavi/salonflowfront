"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/common/http/axios-instance";

interface Params {
  salonId: number;
  staffId?: number | null;
  offeringIds: number[];
  date: string;
}

export function useQueryAvailableSlots(params: Params) {
  // 🔥 normalize inputs (خیلی مهم)
  const salonId = Number(params.salonId);
  const offeringIds = (params.offeringIds ?? []).filter(Boolean);
  const date = params.date;

  // 🚨 FIX اصلی: validation درست
  const isValid =
    Number.isFinite(salonId) &&
    salonId > 0 &&
    !!date &&
    offeringIds.length > 0;

  return useQuery({
    queryKey: [
      "available-slots",
      salonId,
      params.staffId ?? null,
      date,
      offeringIds,
    ],

    enabled: isValid, // 🔥 فقط وقتی valid بود اجرا میشه

    queryFn: async () => {
      const res = await axiosInstance.get("/booking/slots", {
        params: {
          salonId, // 🔥 همیشه عدد تمیز
          staffId: params.staffId ?? undefined,
          offeringIds,
          date: date + "T00:00:00",
        },

        paramsSerializer: (p) => {
          const sp = new URLSearchParams();

          sp.append("salonId", String(p.salonId));

          if (p.staffId != null) {
            sp.append("staffId", String(p.staffId));
          }

          (p.offeringIds ?? []).forEach((id: number) => {
            sp.append("offeringIds", String(id));
          });

          sp.append("date", p.date);

          return sp.toString();
        },
      });

      return res;
    },
  });
}