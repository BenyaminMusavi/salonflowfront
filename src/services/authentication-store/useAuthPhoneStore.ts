"use client";

import { create } from "zustand";

interface IAuthPhoneState {
  phone: string;
  setPhone: (phone: string) => void;
}

/**
 * The phone typed on one auth screen, carried to the next (code ⇄ password login) so the user
 * doesn't type it twice. In memory only — never persisted and never put in a URL.
 */
export const useAuthPhoneStore = create<IAuthPhoneState>((set) => ({
  phone: "",
  setPhone: (phone) => set({ phone }),
}));
