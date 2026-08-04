"use client"
import React, {ReactNode} from 'react';
import { DirectionProvider } from "@radix-ui/react-direction";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import { useSyncMembershipsFromAuthMe } from "@/services/domains/auth/hooks/useSyncMembershipsFromAuthMe";

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

export const RtlDirectionProvider = ({ children }: Props) => (
    <DirectionProvider dir="rtl">
        {children}
    </DirectionProvider>
)

export const DEFAULT_STALE_TIME = 5 * 1000; // 5 seconds
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

export const Providers = composeProvider(
    RtlDirectionProvider,
    QueryProvider,
    AuthMeMembershipsSyncProvider
)
