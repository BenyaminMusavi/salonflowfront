import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ICity, IDistrict } from "../types/locations.type";

/** A city/district the user picked by hand. The only location ever persisted (and, when logged in, sent to the server). */
export interface IManualLocation {
  city: ICity;
  district: IDistrict | null;
  /** ISO time of the user's choice — decides which side wins when syncing with the server. */
  updatedAt: string;
}

/** A device position the user asked for. Memory only: never persisted, never saved on the server. */
export interface IGpsLocation {
  lat: number;
  lng: number;
  at: number;
}

/** Which one the lists use right now. `gps` only after the user tapped «موقعیت فعلی من» in this visit. */
export type TLocationMode = "manual" | "gps" | null;

interface IUserLocationState {
  manual: IManualLocation | null;
  gps: IGpsLocation | null;
  mode: TLocationMode;
  /** The user picked a city/district: it becomes the active location and the saved choice. */
  setManual: (city: ICity, district: IDistrict | null, updatedAt?: string) => void;
  /** Server copy wins on another device: replace the local choice without changing the active mode unless nothing was active. */
  adoptServerManual: (manual: IManualLocation) => void;
  /** Result of a user-requested GPS read. The saved manual choice is kept untouched. */
  setGps: (gps: IGpsLocation) => void;
  /** Leave «موقعیت فعلی» and go back to the saved choice (or to nothing). */
  stopGps: () => void;
  /** «پاک کردن موقعیت»: forget the manual choice (and any GPS of this visit). */
  clear: () => void;
}

export const USER_LOCATION_STORE_NAME = "salon_flow_user_location";

export const useUserLocationStore = create<IUserLocationState>()(
  persist(
    (set, get) => ({
      manual: null,
      gps: null,
      mode: null,
      setManual: (city, district, updatedAt) =>
        set({ manual: { city, district, updatedAt: updatedAt ?? new Date().toISOString() }, mode: "manual" }),
      adoptServerManual: (manual) => set({ manual, mode: get().mode ?? "manual" }),
      setGps: (gps) => set({ gps, mode: "gps" }),
      stopGps: () => set({ gps: null, mode: get().manual ? "manual" : null }),
      clear: () => set({ manual: null, gps: null, mode: null }),
    }),
    {
      name: USER_LOCATION_STORE_NAME,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // GPS never touches storage: after a reload the saved manual choice (if any) is active again.
      partialize: (s) => ({ manual: s.manual }),
      merge: (persisted, current) => {
        const manual = (persisted as { manual?: IManualLocation | null } | undefined)?.manual ?? null;
        return { ...current, manual, mode: manual ? "manual" : null };
      },
    }
  )
);
