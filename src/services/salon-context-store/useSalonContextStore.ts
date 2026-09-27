import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

export interface ISalonMembership {
  salonId: number;
  salonPublicId?: string;
  name: string;
  branchId?: number | null;
  branchPublicId?: string | null;
  roleId?: number;
  roleName?: string;
}

interface ISalonContextState {
  salonId: number | null;
  branchId: number | null;
  salonPublicId: string | null;
  branchPublicId: string | null;
  salonName: string | null;
  /** Last salon opened in the panel — default pick for a new tab (shared across tabs). */
  lastSalonPublicId: string | null;
  memberships: ISalonMembership[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setActiveContext: (membership: ISalonMembership) => void;
  setMemberships: (memberships: ISalonMembership[]) => void;
  clearContext: () => void;
  clearAll: () => void;
}

const emptyContext = {
  salonId: null as number | null,
  branchId: null as number | null,
  salonPublicId: null as string | null,
  branchPublicId: null as string | null,
  salonName: null as string | null,
};

type TActiveContext = typeof emptyContext;
type TSharedState = Pick<ISalonContextState, "memberships" | "lastSalonPublicId">;
type TPersisted = TActiveContext & TSharedState;

/**
 * ADR-0012: the active panel salon is per tab (sessionStorage) so one tab can be in the
 * panel while another books as a customer. Memberships and the last-used salon are
 * shared (localStorage) so a new tab can auto-pick it.
 */
const splitStorage: PersistStorage<TPersisted> = {
  getItem: (name) => {
    try {
      const active = JSON.parse(sessionStorage.getItem(name) ?? "null") as TActiveContext | null;
      const shared = JSON.parse(localStorage.getItem(name) ?? "null") as
        | StorageValue<TSharedState>
        | null;
      return {
        state: {
          ...emptyContext,
          memberships: shared?.state?.memberships ?? [],
          lastSalonPublicId: shared?.state?.lastSalonPublicId ?? null,
          ...(active ?? {}),
        },
        version: shared?.version ?? 0,
      };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const { memberships, lastSalonPublicId, ...active } = value.state;
    try {
      sessionStorage.setItem(name, JSON.stringify(active));
      localStorage.setItem(
        name,
        JSON.stringify({ state: { memberships, lastSalonPublicId }, version: value.version })
      );
    } catch {
      /* storage unavailable — context stays in memory for this tab */
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useSalonContextStore = create<ISalonContextState>()(
  persist(
    (set) => ({
      ...emptyContext,
      lastSalonPublicId: null,
      memberships: [],
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setActiveContext: (m) =>
        set({
          salonId: m.salonId,
          branchId: m.branchId ?? null,
          salonPublicId: m.salonPublicId ?? null,
          branchPublicId: m.branchPublicId ?? null,
          salonName: m.name,
          lastSalonPublicId: m.salonPublicId ?? null,
        }),
      setMemberships: (memberships) => set({ memberships }),
      clearContext: () => set({ ...emptyContext }),
      clearAll: () =>
        set({ ...emptyContext, memberships: [], lastSalonPublicId: null }),
    }),
    {
      name: "salon_flow_salon_context",
      storage: splitStorage,
      partialize: (state) => ({
        salonId: state.salonId,
        branchId: state.branchId,
        salonPublicId: state.salonPublicId,
        branchPublicId: state.branchPublicId,
        salonName: state.salonName,
        lastSalonPublicId: state.lastSalonPublicId,
        memberships: state.memberships,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
