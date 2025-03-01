'use client';

import { Providers } from "@/lib/providers";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import Header from "@/components/ui/header";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isStoreRoute, setIsStoreRoute] = useState(false);
  
  useEffect(() => {
    // Check if this is a store route
    const isStore = pathname?.startsWith('/store/');
    setIsStoreRoute(isStore);
    
    // Check if we have a subdomain cookie
    const hasSubdomainCookie = document.cookie.includes('subdomain=');
    
    if (hasSubdomainCookie && !isStore) {
      // We're on a subdomain but not in a store route - this is the issue
      console.log('Subdomain detected but not in store route. Current path:', pathname);
    }
  }, [pathname]);
  
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Providers>
          {/* Only show the header on non-store routes */}
          {!isStoreRoute && <Header />}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
