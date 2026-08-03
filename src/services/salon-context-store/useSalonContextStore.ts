import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ISalonMembership {
  salonId: number;
  salonPublicId?: string;
  name: string;
  branchId?: number | null;
}

interface ISalonContextState {
  salonId: number | null;
  branchId: number | null;
  salonPublicId: string | null;
  salonName: string | null;
  memberships: ISalonMembership[];
  setActiveContext: (ctx: {
    salonId: number | null;
    branchId?: number | null;
    salonPublicId?: string | null;
    salonName?: string | null;
  }) => void;
  setMemberships: (memberships: ISalonMembership[]) => void;
  upsertMembership: (membership: ISalonMembership) => void;
  clearContext: () => void;
  clearAll: () => void;
}

const emptyContext = {
  salonId: null as number | null,
  branchId: null as number | null,
  salonPublicId: null as string | null,
  salonName: null as string | null,
};

export const useSalonContextStore = create<ISalonContextState>()(
  persist(
    (set, get) => ({
      ...emptyContext,
      memberships: [],
      setActiveContext: (ctx) =>
        set({
          salonId: ctx.salonId,
          branchId: ctx.branchId ?? null,
          salonPublicId: ctx.salonPublicId ?? null,
          salonName: ctx.salonName ?? null,
        }),
      setMemberships: (memberships) => set({ memberships }),
      upsertMembership: (membership) => {
        const existing = get().memberships;
        const idx = existing.findIndex((m) => m.salonId === membership.salonId);
        if (idx === -1) {
          set({ memberships: [...existing, membership] });
          return;
        }
        const next = [...existing];
        next[idx] = { ...next[idx], ...membership };
        set({ memberships: next });
      },
      clearContext: () => set({ ...emptyContext }),
      clearAll: () => set({ ...emptyContext, memberships: [] }),
    }),
    {
      name: "salon_flow_salon_context",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
