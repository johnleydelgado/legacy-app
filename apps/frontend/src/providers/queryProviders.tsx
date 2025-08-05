// providers/QueryProvider.tsx
'use client';
import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
    children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = React.useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                retry: (failureCount, error: any) => {
                    // Don't retry on 4xx errors
                    if (error?.response?.status >= 400 && error?.response?.status < 500) {
                        return false;
                    }
                    return failureCount < 3;
                },
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
