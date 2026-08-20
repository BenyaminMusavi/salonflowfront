import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IFavoriteIdsState {
  ids: string[];
  setIds: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useFavoriteIdsStore = create<IFavoriteIdsState>()(
  persist(
    (set, get) => ({
      ids: [],
      setIds: (ids) => set({ ids: Array.from(new Set(ids.filter(Boolean))) }),
      add: (id) => {
        if (!id || get().ids.includes(id)) return;
        set({ ids: [...get().ids, id] });
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "salon_flow_favorite_ids",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
