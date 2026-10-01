"use client";

import { create } from "zustand";
import { salonTodayYmd } from "@/shared/utils/salonTime";

export interface IQuickBookCustomer {
  phone: string;
  fullName: string;
}

interface IQuickBookState {
  open: boolean;
  /** Salon day (`yyyy-MM-dd`) the drawer books into. */
  date: string;
  /** Customer already chosen (e.g. «نوبت جدید» on a customer's page). */
  customer: IQuickBookCustomer | null;
  /** Day the appointments board is showing, so «＋» books into it instead of always today. */
  boardDate: string | null;
  setBoardDate: (date: string | null) => void;
  openQuickBook: (options?: { customer?: IQuickBookCustomer }) => void;
  setOpen: (open: boolean) => void;
}

/** Panel-wide quick-book drawer state: opened from the nav «＋», rendered once in the dashboard layout. */
export const useQuickBookStore = create<IQuickBookState>((set, get) => ({
  open: false,
  date: salonTodayYmd(),
  customer: null,
  boardDate: null,
  setBoardDate: (boardDate) => set({ boardDate }),
  openQuickBook: (options) =>
    set({
      open: true,
      date: get().boardDate ?? salonTodayYmd(),
      customer: options?.customer ?? null,
    }),
  setOpen: (open) => set({ open }),
}));
