'use client';

import { Providers } from "@/lib/providers";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import Header from "@/components/ui/header";
import { SessionProvider } from "next-auth/react";
import ApolloProviderWrapper from "@/components/apollo-provider";
import { StoreProvider } from "@/context/store-context";
import { ErrorBoundary } from 'react-error-boundary';
import AuthError from '@/components/auth-error';
import UserSyncProvider from "@/components/user-sync-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Providers>
          <StoreProvider>
            <SessionProvider>
              <ErrorBoundary FallbackComponent={AuthError}>
                <UserSyncProvider>
                  <ApolloProviderWrapper>
                    <Header />
                    <main>{children}</main>
                  </ApolloProviderWrapper>
                </UserSyncProvider>
              </ErrorBoundary>
            </SessionProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
