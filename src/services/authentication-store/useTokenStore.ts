import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import { IAuth } from "@/services/domains/auth/types/auth.type";

interface ITokenState {
  token?: IAuth;
  setToken: (token: IAuth, isLoggedIn?: boolean) => void;
  isLoggedIn: boolean;
  redirectUrl?: string;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setRedirectUrl: (pathName: string) => void;
  clear: () => void;
}

const initial = {
  token: undefined,
  isLoggedIn: false,
  redirectUrl: undefined,
};
const TOKEN_STORE_NAME = 'salon_flow_token_state';

export const useTokenStore = create<ITokenState>()(
  persist(
    (set, get) => ({
      ...initial,
      setToken: (token, isLoggedIn = false) => {
        set({
          token: token,
          isLoggedIn: isLoggedIn,
        });
      },
      setRedirectUrl: (pathName) => {
        set({
          redirectUrl: pathName,
        });
      },
      clear: () => {
        set(initial);
      },
      setIsLoggedIn: (isLoggedIn) => {
        set({
          isLoggedIn: isLoggedIn,
        });
      },
    }),
    {
      name: TOKEN_STORE_NAME,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Zustand's `persist` writes to localStorage but never listens for it — each tab's
 * in-memory token stays whatever it last set, even after another tab rotates the
 * refresh token or logs out. A tab left holding the old token then fails its own
 * refresh attempt and force-logs-out, wiping the shared localStorage out from under
 * every other (still valid) tab too (SF-QA-016). Re-hydrating on `storage` keeps every
 * open tab on the same token the moment any one of them changes it, so a stale tab
 * picks up the rotated token instead of ever attempting a doomed refresh of its own.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== TOKEN_STORE_NAME) return;
    void useTokenStore.persist.rehydrate();
  });
}
