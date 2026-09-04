"use client"
import React, {ReactNode, useEffect} from 'react';
import { DirectionProvider } from "@radix-ui/react-direction";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import { useSyncMembershipsFromAuthMe } from "@/services/domains/auth/hooks/useSyncMembershipsFromAuthMe";
import StaffInvitationPrompt from "@/shared/components/composites/staff-invitation-prompt/StaffInvitationPrompt";
import { useThemeStore } from "@/services/theme-store/useThemeStore";

type Props = {
    children: ReactNode
}

type Provider = (p: Props) => ReactNode;

export const composeProvider = (...p: Provider[]) => (
    p.reduceRight(
        (Acc, P) => ({children}: Props) =>
            <P><Acc>{children}</Acc></P>,
        ({children}: Props) => <>{children}</>
    )
)

/** Keeps <html data-theme> in sync with the store after mount (the inline
 * script in the root layout sets the initial value before paint). */
export const ThemeSyncProvider = ({ children }: Props) => {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    return <>{children}</>;
}

export const RtlDirectionProvider = ({ children }: Props) => (
    <DirectionProvider dir="rtl">
        {children}
    </DirectionProvider>
)

export const DEFAULT_STALE_TIME = 60 * 1000; // 60 seconds
export const globalQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: DEFAULT_STALE_TIME,
            gcTime: 10 * DEFAULT_STALE_TIME,
            // refetchOnWindowFocus: false
        },
    },
});

export const QueryProvider = ({ children }: Props) => {
    return (
        <QueryClientProvider client={globalQueryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
        </QueryClientProvider>
    )
}

/** Must sit under QueryProvider so useQueryAuthMe can run. */
export const AuthMeMembershipsSyncProvider = ({ children }: Props) => {
    useSyncMembershipsFromAuthMe();
    return <>{children}</>;
}

/**
 * Renders the accept/reject dialog for pendingStaffInvitations app-wide, so it
 * surfaces right after OTP login regardless of which page the user lands on.
 */
export const StaffInvitationPromptProvider = ({ children }: Props) => {
    return (
        <>
            <StaffInvitationPrompt />
            {children}
        </>
    );
}

export const Providers = composeProvider(
    ThemeSyncProvider,
    RtlDirectionProvider,
    QueryProvider,
    AuthMeMembershipsSyncProvider,
    StaffInvitationPromptProvider
)
