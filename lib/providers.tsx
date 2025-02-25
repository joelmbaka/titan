'use client';

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import ApolloProviderWrapper from "@/components/apollo-provider";
import { StoreProvider } from "@/context/store-context";
import { ErrorBoundary } from 'react-error-boundary';
import AuthError from '@/components/auth-error';
import UserSyncProvider from "@/components/user-sync-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <StoreProvider>
        <SessionProvider>
          <ErrorBoundary FallbackComponent={AuthError}>
            <UserSyncProvider>
              <ApolloProviderWrapper>
                {children}
              </ApolloProviderWrapper>
            </UserSyncProvider>
          </ErrorBoundary>
        </SessionProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
