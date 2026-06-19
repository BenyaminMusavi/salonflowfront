import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IBusiness {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface IBusinessState {
  businesses: IBusiness[];
  activeBusinessId: string | null;
  addBusiness: (b: IBusiness) => void;
  setActiveBusiness: (id: string) => void;
  removeBusiness: (id: string) => void;
}

export const useBusinessStore = create<IBusinessState>()(
  persist(
    (set) => ({
      businesses: [],
      activeBusinessId: null,
      addBusiness: (b) =>
        set((s) => ({ businesses: [...s.businesses, b] })),
      setActiveBusiness: (id) => set({ activeBusinessId: id }),
      removeBusiness: (id) =>
        set((s) => ({
          businesses: s.businesses.filter((b) => b.id !== id),
          activeBusinessId:
            s.activeBusinessId === id ? null : s.activeBusinessId,
        })),
    }),
    {
      name: "salon_flow_business_state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
