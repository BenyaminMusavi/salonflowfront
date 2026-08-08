export const availableSlotsKey = {
  all: ["available-slots"] as const,

  list: (params: {
    salonPublicId: string;
    branchPublicId: string;
    staffPublicId?: string | null;
    offeringPublicIds: string[];
    date: string;
  }) =>
    [
      ...availableSlotsKey.all,
      params.salonPublicId,
      params.branchPublicId,
      params.staffPublicId ?? null,
      params.date,
      [...params.offeringPublicIds].sort().join("-"),
    ] as const,
};
