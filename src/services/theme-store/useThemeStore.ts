import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "dark" | "light";

interface IThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORE_NAME = "salon_flow_theme_state";

export const useThemeStore = create<IThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    {
      name: THEME_STORE_NAME,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
