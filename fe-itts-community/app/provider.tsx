// app/provider.tsx
'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from '@/feature/auth';

type Mode = 'light' | 'dark' | 'system';

export default function Providers({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode: Mode;
}) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15 * 1000, // 15 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider initialMode={initialMode}>{children}</ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
