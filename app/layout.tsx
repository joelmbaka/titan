'use client';

import { Providers } from "@/lib/providers";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import Header from "@/components/ui/header";
import { SessionProvider } from "next-auth/react";
import ApolloProviderWrapper from "@/components/apollo-provider";
import { StoreProvider } from "@/context/store-context";
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AuthError from '@/components/auth-error';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('RootLayout - Mounted');
    return () => console.log('RootLayout - Unmounted');
  }, []);

  useEffect(() => {
    const handleSessionError = (ev: ErrorEvent) => {
      console.error('Session error:', ev.error);
    };

    window.addEventListener('error', handleSessionError);
    return () => window.removeEventListener('error', handleSessionError);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Providers>
          <StoreProvider>
            <SessionProvider 
              refetchInterval={300} 
              refetchOnWindowFocus={true}
              basePath="/api/auth"
            >
              <ErrorBoundary fallback={<AuthError />}>
                <ApolloProviderWrapper>
                  <Header />
                  <main>{children}</main>
                </ApolloProviderWrapper>
              </ErrorBoundary>
            </SessionProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
