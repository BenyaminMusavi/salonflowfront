"use client";

import { create } from "zustand";
import { salonTodayYmd } from "@/shared/utils/salonTime";

interface IQuickBookState {
  open: boolean;
  /** Salon day (`yyyy-MM-dd`) the drawer books into. */
  date: string;
  /** Day the appointments board is showing, so «＋» books into it instead of always today. */
  boardDate: string | null;
  setBoardDate: (date: string | null) => void;
  openQuickBook: () => void;
  setOpen: (open: boolean) => void;
}

/** Panel-wide quick-book drawer state: opened from the nav «＋», rendered once in the dashboard layout. */
export const useQuickBookStore = create<IQuickBookState>((set, get) => ({
  open: false,
  date: salonTodayYmd(),
  boardDate: null,
  setBoardDate: (boardDate) => set({ boardDate }),
  openQuickBook: () =>
    set({ open: true, date: get().boardDate ?? salonTodayYmd() }),
  setOpen: (open) => set({ open }),
}));
