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
      name: 'salon_flow_token_state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
