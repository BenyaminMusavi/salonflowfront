// useTokenStore.ts
import { create } from 'zustand';

interface IAuthState {
    accessToken?: string;
    isLoggedIn: boolean;
    redirectUrl?: string;

    setAccessToken: (token?: string) => void;
    setRedirectUrl: (url: string) => void;
    clear: () => void;
}

export const useTokenStore = create<IAuthState>((set) => ({
    accessToken: undefined,
    isLoggedIn: false,
    redirectUrl: undefined,

    setAccessToken: (token) =>
        set({
            accessToken: token,
            isLoggedIn: Boolean(token),
        }),

    setRedirectUrl: (url) =>
        set({
            redirectUrl: url,
        }),

    clear: () =>
        set({
            accessToken: undefined,
            isLoggedIn: false,
            redirectUrl: undefined,
        }),
}));
