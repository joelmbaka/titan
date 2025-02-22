import { Providers } from "@/lib/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { SessionProvider } from "next-auth/react";
import ApolloProviderWrapper from "@/components/apollo-provider";
import { StoreProvider } from "@/context/store-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promoter AI - Automated Store Management",
  description: "AI-powered ecommerce management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <StoreProvider>
            <SessionProvider>
              <ApolloProviderWrapper>
                <Header />
                <main>{children}</main>
              </ApolloProviderWrapper>
            </SessionProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
