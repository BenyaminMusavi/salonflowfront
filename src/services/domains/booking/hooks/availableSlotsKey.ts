export const availableSlotsKey = {
  all: ["available-slots"] as const,

  list: (params: {
    salonId: string | number;
    branchId: number;
    staffId?: number | null;
    offeringIds: number[];
    date: string;
  }) =>
    [
      ...availableSlotsKey.all,
      params.salonId,
      params.branchId,
      params.staffId ?? null,
      params.date,
      [...params.offeringIds].sort((a, b) => a - b).join("-"),
    ] as const,
};
