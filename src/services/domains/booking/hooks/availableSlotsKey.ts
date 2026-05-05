export const availableSlotsKey = {
  all: ["available-slots"] as const,

  list: (params: {
    salonId: number;
    staffId?: number | null;
    offeringIds: number[];
    date: string;
  }) => [...availableSlotsKey.all, params] as const,
};