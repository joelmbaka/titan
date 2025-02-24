'use client';

import { Providers } from "@/lib/providers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { SessionProvider } from "next-auth/react";
import ApolloProviderWrapper from "@/components/apollo-provider";
import { StoreProvider } from "@/context/store-context";
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AuthError from '@/components/auth-error';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('RootLayout - Mounted');
    return () => console.log('RootLayout - Unmounted');
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <StoreProvider>
            <SessionProvider refetchInterval={300} refetchOnWindowFocus={true}>
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
